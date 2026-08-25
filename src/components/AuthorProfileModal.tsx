import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User as UserIcon, Mail, Edit3, Calendar, BookOpen, Heart, Sparkles, Check } from 'lucide-react';
import { User, Post } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface AuthorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: User | null;
  posts?: Post[];
  onSelectPost?: (post: Post) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  isOpen,
  onClose,
  author,
  posts = [],
  onSelectPost,
}) => {
  const { user: currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();

  const isSelf = currentUser && author && currentUser.id === author.id;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(author?.name || '');
  const [bio, setBio] = useState(author?.bio || '');
  const [avatar, setAvatar] = useState(author?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (author) {
      setName(author.name || '');
      setBio(author.bio || '');
      setAvatar(author.avatar || '');
      setIsEditing(false);
    }
  }, [author, isOpen]);

  if (!isOpen || !author) return null;

  const authorPosts = posts.filter((p) => p.authorId === author.id);
  const totalLikes = authorPosts.reduce((acc, p) => acc + p.likesCount, 0);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, bio, avatar });
      showToast('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = new Date(author.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white text-stone-900 rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-10 max-h-[88vh] flex flex-col"
        >
          {/* Header Graphic */}
          <div className="h-28 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-4 flex justify-end relative">
            <button
              id="profile-modal-close-btn"
              onClick={onClose}
              className="text-stone-300 hover:text-white p-1.5 rounded-lg bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Header info */}
          <div className="px-6 pb-6 pt-0 relative flex-1 overflow-y-auto">
            <div className="flex justify-between items-end -mt-12 mb-4">
              <img
                src={avatar || author.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Author'}
                alt={author.name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md bg-stone-100"
                referrerPolicy="no-referrer"
              />
              {isSelf && !isEditing && (
                <button
                  id="profile-edit-toggle-btn"
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50 hover:border-stone-400 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {isEditing ? (
              /* EDIT PROFILE FORM */
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <input
                    id="edit-profile-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    id="edit-profile-avatar-input"
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Bio & Expertise
                  </label>
                  <textarea
                    id="edit-profile-bio-input"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell readers about yourself..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    id="save-profile-btn"
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW PROFILE */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-serif text-stone-900 tracking-tight">{author.name}</h2>
                    {author.role === 'admin' && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 font-mono">@{author.username}</p>
                </div>

                <p className="text-sm text-stone-700 leading-relaxed">
                  {author.bio || 'This author has not added a bio yet.'}
                </p>

                {/* Meta stats bar */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 border border-stone-200/80 rounded-xl text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-stone-500 text-xs font-medium mb-0.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Stories</span>
                    </div>
                    <p className="text-lg font-bold text-stone-900">{authorPosts.length}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-stone-500 text-xs font-medium mb-0.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>Likes</span>
                    </div>
                    <p className="text-lg font-bold text-stone-900">{totalLikes}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-stone-500 text-xs font-medium mb-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Joined</span>
                    </div>
                    <p className="text-xs font-semibold text-stone-800 mt-1">{formattedDate}</p>
                  </div>
                </div>

                {/* Published Articles List */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Published Stories ({authorPosts.length})
                  </h3>
                  {authorPosts.length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-2">No articles published yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {authorPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => {
                            if (onSelectPost) {
                              onSelectPost(post);
                              onClose();
                            }
                          }}
                          className="p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-stone-900 truncate group-hover:text-amber-800 transition-colors">
                              {post.title}
                            </h4>
                            <p className="text-xs text-stone-500 line-clamp-1">{post.excerpt}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-stone-400 shrink-0">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-stone-400" /> {post.likesCount}
                            </span>
                            <span>{post.readTimeMinutes} min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
