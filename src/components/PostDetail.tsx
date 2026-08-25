import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  Tag,
  User as UserIcon,
} from 'lucide-react';
import { Post, Comment, User } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { CommentsSection } from './CommentsSection.tsx';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  onSelectAuthor: (author: any) => void;
  onSelectTag: (tag: string) => void;
  onEditPost: (post: Post) => void;
  onPostDeleted: (postId: string) => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post: initialPost,
  onBack,
  onSelectAuthor,
  onSelectTag,
  onEditPost,
  onPostDeleted,
}) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState<Post>(initialPost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isAuthor = user && (user.id === post.authorId || user.role === 'admin');
  const isLiked = user ? post.likedBy?.includes(user.id) : false;
  const isBookmarked = user ? post.bookmarkedBy?.includes(user.id) : false;

  // Fetch latest post data and comments
  useEffect(() => {
    let isMounted = true;

    async function loadPostData() {
      try {
        const [freshPost, freshComments] = await Promise.all([
          api.getPost(initialPost.id),
          api.getComments(initialPost.id),
        ]);
        if (isMounted) {
          setPost(freshPost);
          setComments(freshComments);
          setIsLoadingComments(false);
        }
      } catch (err) {
        console.error('Error fetching post detail or comments:', err);
        if (isMounted) setIsLoadingComments(false);
      }
    }

    loadPostData();
    return () => {
      isMounted = false;
    };
  }, [initialPost.id]);

  const handleToggleLike = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      const res = await api.togglePostLike(post.id);
      setPost((prev) => {
        const likedBy = res.liked
          ? [...(prev.likedBy || []), user.id]
          : (prev.likedBy || []).filter((id) => id !== user.id);
        return {
          ...prev,
          likesCount: res.likesCount,
          likedBy,
        };
      });
      showToast(res.liked ? 'Story added to your liked stories!' : 'Story unliked');
    } catch (err: any) {
      showToast(err.message || 'Failed to like story', 'error');
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      const res = await api.togglePostBookmark(post.id);
      setPost((prev) => {
        const bookmarkedBy = res.bookmarked
          ? [...(prev.bookmarkedBy || []), user.id]
          : (prev.bookmarkedBy || []).filter((id) => id !== user.id);
        return {
          ...prev,
          bookmarksCount: res.bookmarksCount,
          bookmarkedBy,
        };
      });
      showToast(res.bookmarked ? 'Story saved to your reading list!' : 'Story removed from reading list');
    } catch (err: any) {
      showToast(err.message || 'Failed to bookmark story', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      showToast('Story link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.deletePost(post.id);
      showToast('Story deleted successfully');
      setShowDeleteModal(false);
      onPostDeleted(post.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete story', 'error');
      setIsDeleting(false);
    }
  };

  // Comments handlers
  const handleAddComment = async (content: string, parentId?: string | null) => {
    const newComment = await api.createComment(post.id, { content, parentId });
    setComments((prev) => [...prev, newComment]);
    setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
  };

  const handleDeleteComment = async (commentId: string) => {
    await api.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
    setPost((prev) => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }));
  };

  const handleLikeComment = async (commentId: string) => {
    const res = await api.toggleCommentLike(commentId);
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const likedBy = res.liked
            ? [...c.likedBy, user!.id]
            : c.likedBy.filter((id) => id !== user!.id);
          return { ...c, likesCount: res.likesCount, likedBy };
        }
        return c;
      })
    );
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6"
    >
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          id="back-to-feed-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stories</span>
        </button>

        {/* Author management controls */}
        {isAuthor && (
          <div className="flex items-center gap-2">
            <button
              id="detail-edit-post-btn"
              onClick={() => onEditPost(post)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Story</span>
            </button>
            <button
              id="detail-delete-post-btn"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Article Header */}
      <header className="mb-8">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {post.tags.map((t) => (
            <button
              key={t}
              onClick={() => onSelectTag(t)}
              className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
            >
              #{t}
            </button>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        {/* Excerpt / Subtitle */}
        {post.excerpt && (
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed mb-6 font-normal">
            {post.excerpt}
          </p>
        )}

        {/* Author Card & Publication metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-stone-200/80">
          <div
            onClick={() => onSelectAuthor(post.author)}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src={post.author.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Author'}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover border border-stone-200 shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-sm font-bold text-stone-900 hover:underline">{post.author.name}</p>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readTimeMinutes} min read
                </span>
              </div>
            </div>
          </div>

          {/* Social Interactions Bar */}
          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              id="detail-like-btn"
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isLiked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{post.likesCount}</span>
            </button>

            {/* Bookmark */}
            <button
              id="detail-bookmark-btn"
              onClick={handleToggleBookmark}
              className={`p-2 rounded-full border transition-all ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-2xs'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
              title="Bookmark story"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
            </button>

            {/* Share link */}
            <button
              id="detail-share-btn"
              onClick={handleShare}
              className="p-2 rounded-full border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-all"
              title="Share story link"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-10 rounded-2xl overflow-hidden shadow-md bg-stone-100 border border-stone-200 max-h-[480px]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Article Markdown Body */}
      <article className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-stone-800 prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg prose-a:text-amber-800 prose-a:underline hover:prose-a:text-amber-950 prose-blockquote:border-l-amber-700 prose-blockquote:bg-stone-100/70 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-code:bg-stone-100 prose-code:text-stone-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-stone-900 prose-pre:text-stone-100 prose-pre:rounded-xl">
        <div className="markdown-body space-y-4 text-stone-800 text-base sm:text-lg leading-relaxed">
          <Markdown>{post.content}</Markdown>
        </div>
      </article>

      {/* Author Bio Box */}
      <div className="mt-12 p-6 bg-stone-100/70 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <img
          src={post.author.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Author'}
          alt={post.author.name}
          className="w-14 h-14 rounded-full object-cover border border-stone-300"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold font-serif text-stone-900 text-base">{post.author.name}</h4>
            <span className="text-xs text-stone-500 font-mono">@{post.author.username}</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {post.author.bio || 'Writer on Chronicle.'}
          </p>
        </div>
        <button
          onClick={() => onSelectAuthor(post.author)}
          className="px-3.5 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors shadow-2xs shrink-0"
        >
          View Profile
        </button>
      </div>

      {/* Threaded Comments Section */}
      <CommentsSection
        postId={post.id}
        postAuthorId={post.authorId}
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onLikeComment={handleLikeComment}
        onSelectAuthor={onSelectAuthor}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 z-10 space-y-4"
            >
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-stone-900">Delete this story?</h3>
                <p className="text-xs text-stone-500 mt-1">
                  This action cannot be undone. All comments and reactions associated with this post will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  id="confirm-delete-post-btn"
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
