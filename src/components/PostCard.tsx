import React from 'react';
import { motion } from 'motion/react';
import { Heart, MessageSquare, Bookmark, Clock, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Post, User } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface PostCardProps {
  post: Post;
  onSelect: (post: Post) => void;
  onSelectAuthor: (author: any) => void;
  onSelectTag: (tag: string) => void;
  onLikeToggle?: (postId: string) => void;
  onBookmarkToggle?: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelect,
  onSelectAuthor,
  onSelectTag,
  onLikeToggle,
  onBookmarkToggle,
  onEditPost,
  onDeletePost,
}) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const isAuthor = user && (user.id === post.authorId || user.role === 'admin');
  const isLiked = user ? post.likedBy?.includes(user.id) : false;
  const isBookmarked = user ? post.bookmarkedBy?.includes(user.id) : false;

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (onLikeToggle) {
      onLikeToggle(post.id);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (onBookmarkToggle) {
      onBookmarkToggle(post.id);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(post)}
      className="group bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 hover:border-stone-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Author Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectAuthor(post.author);
            }}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <img
              src={post.author.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Author'}
              alt={post.author.name}
              className="w-8 h-8 rounded-full object-cover border border-stone-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-xs font-semibold text-stone-900 leading-tight hover:underline">
                {post.author.name}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {post.readTimeMinutes} min read
                </span>
              </div>
            </div>
          </div>

          {/* Actions for Author */}
          {isAuthor && (
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              {onEditPost && (
                <button
                  id={`edit-post-btn-${post.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPost(post);
                  }}
                  className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Edit post"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDeletePost && (
                <button
                  id={`delete-post-btn-${post.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePost(post);
                  }}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between items-start my-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900 tracking-tight leading-snug group-hover:text-amber-950 transition-colors line-clamp-2 mb-2">
              {post.title}
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed font-normal">
              {post.excerpt}
            </p>
          </div>

          {post.coverImage && (
            <div className="w-full sm:w-36 h-28 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Meta & Interaction Actions */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
          {post.tags.slice(0, 3).map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTag(tag);
              }}
              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[11px] transition-colors"
            >
              #{tag}
            </button>
          ))}
          {post.tags.length > 3 && (
            <span className="text-[10px] text-stone-400">+{post.tags.length - 3}</span>
          )}
        </div>

        {/* Action Counts */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isLiked ? 'text-rose-600 bg-rose-50 font-semibold' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{post.likesCount}</span>
          </button>

          {/* Comments count */}
          <div className="flex items-center gap-1 text-stone-500">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post.commentCount || 0}</span>
          </div>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked ? 'text-amber-600 bg-amber-50' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
          </button>
        </div>
      </div>
    </motion.article>
  );
};
