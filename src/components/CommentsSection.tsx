import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Trash2, Reply, Send, CornerDownRight, LogIn, Check } from 'lucide-react';
import { Comment, User } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface CommentsSectionProps {
  postId: string;
  postAuthorId: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string | null) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  onSelectAuthor: (author: any) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  postAuthorId,
  comments,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onSelectAuthor,
}) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(commentText.trim(), null);
      setCommentText('');
      showToast('Comment published!');
    } catch (err: any) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(replyText.trim(), parentId);
      setReplyText('');
      setReplyingToId(null);
      showToast('Reply published!');
    } catch (err: any) {
      showToast(err.message || 'Failed to post reply', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      await onDeleteComment(commentId);
      showToast('Comment deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete comment', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Group comments: top-level vs replies
  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  const renderCommentItem = (comment: Comment, isReply = false) => {
    const isOwner = user && (user.id === comment.authorId || user.id === postAuthorId || user.role === 'admin');
    const isLiked = user ? comment.likedBy?.includes(user.id) : false;
    const replies = getReplies(comment.id);

    const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div
        key={comment.id}
        className={`group relative rounded-xl transition-all ${
          isReply
            ? 'ml-8 sm:ml-12 mt-3 p-3.5 bg-stone-50 border border-stone-200/70'
            : 'p-4 bg-white border border-stone-200/90 shadow-2xs'
        }`}
      >
        {/* Comment Header */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div
            onClick={() => onSelectAuthor(comment.author)}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src={comment.author.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
              alt={comment.author.name}
              className="w-7 h-7 rounded-full object-cover border border-stone-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-xs font-bold text-stone-900 leading-none hover:underline">
                {comment.author.name}
              </span>
              {comment.authorId === postAuthorId && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-semibold bg-amber-100 text-amber-900 rounded border border-amber-200">
                  Author
                </span>
              )}
              <span className="text-[11px] text-stone-400 ml-2">{formattedDate}</span>
            </div>
          </div>

          {/* Delete Action */}
          {isOwner && (
            <button
              onClick={() => handleDelete(comment.id)}
              disabled={deletingId === comment.id}
              className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
              title="Delete comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Comment Body */}
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line pl-9">
          {comment.content}
        </p>

        {/* Comment Actions Bar */}
        <div className="flex items-center gap-4 mt-2.5 pl-9 text-xs text-stone-500">
          {/* Like */}
          <button
            onClick={() => {
              if (!user) openAuthModal('login');
              else onLikeComment(comment.id);
            }}
            className={`flex items-center gap-1 hover:text-stone-900 transition-colors ${
              isLiked ? 'text-rose-600 font-semibold' : ''
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{comment.likesCount}</span>
          </button>

          {/* Reply Button (only on top-level) */}
          {!isReply && (
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                } else {
                  setReplyingToId(replyingToId === comment.id ? null : comment.id);
                  setReplyText('');
                }
              }}
              className="flex items-center gap-1 hover:text-stone-900 transition-colors font-medium"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Reply Form (Inline) */}
        {replyingToId === comment.id && (
          <div className="mt-3 ml-9 p-3 bg-stone-100 rounded-xl border border-stone-200">
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Replying to ${comment.author.name}...`}
              className="w-full p-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setReplyingToId(null)}
                className="px-3 py-1 text-xs text-stone-600 hover:text-stone-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={isSubmitting || !replyText.trim()}
                className="px-3 py-1 text-xs bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Post Reply</span>
              </button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div className="space-y-2 mt-2">
            {replies.map((reply) => renderCommentItem(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="mt-12 pt-8 border-t border-stone-200">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-stone-700" />
          <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 tracking-tight">
            Responses & Discussion ({comments.length})
          </h3>
        </div>
      </div>

      {/* Main Comment Box */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <img
              src={user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
              alt={user.name}
              className="w-6 h-6 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-semibold text-stone-800">
              Posting as <span className="font-bold text-stone-900">{user.name}</span>
            </span>
          </div>

          <textarea
            id="new-comment-textarea"
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts, feedback, or questions on this story..."
            required
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all resize-none"
          />

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
            <span className="text-[11px] text-stone-400">Be respectful and constructive</span>
            <button
              id="submit-comment-btn"
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Respond'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Guest prompt */
        <div className="mb-8 p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-amber-950">Join the discussion</h4>
            <p className="text-xs text-amber-800 mt-0.5">Sign in to leave a response, like comments, and engage with the author.</p>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Comment</span>
          </button>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-10 px-4 bg-stone-50/60 rounded-2xl border border-dashed border-stone-200">
          <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700">No responses yet</p>
          <p className="text-xs text-stone-500 mt-0.5">Be the first to share your thoughts on this story!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => renderCommentItem(comment, false))}
        </div>
      )}
    </section>
  );
};
