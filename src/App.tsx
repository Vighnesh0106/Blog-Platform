import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PenSquare,
  Sparkles,
  BookOpen,
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  Search,
  Bookmark,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Post, User } from './types.ts';
import { api } from './services/api.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { PostCard } from './components/PostCard.tsx';
import { PostDetail } from './components/PostDetail.tsx';
import { PostEditor } from './components/PostEditor.tsx';
import { AuthorProfileModal } from './components/AuthorProfileModal.tsx';

function MainBlogApp() {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
  const [stats, setStats] = useState<{
    totalPosts: number;
    totalUsers: number;
    totalComments: number;
    totalLikes: number;
  }>({ totalPosts: 0, totalUsers: 0, totalComments: 0, totalLikes: 0 });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<'all' | 'my-stories' | 'bookmarks'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');

  // Author Profile Modal
  const [viewingAuthor, setViewingAuthor] = useState<User | null>(null);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState<boolean>(false);

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedPosts, fetchedTags, fetchedStats] = await Promise.all([
        api.getPosts({
          tag: selectedTag || undefined,
          search: searchQuery.trim() || undefined,
          authorId: activeFilter === 'my-stories' && user ? user.id : undefined,
          bookmarked: activeFilter === 'bookmarks' ? true : undefined,
          sortBy,
        }),
        api.getTags(),
        api.getStats(),
      ]);

      setPosts(fetchedPosts);
      setTags(fetchedTags);
      setStats(fetchedStats);
    } catch (err: any) {
      console.error('Error fetching blog data:', err);
      showToast(err.message || 'Failed to load posts', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTag, searchQuery, activeFilter, sortBy, user, showToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handler: Like Toggle on Feed
  const handleLikeToggle = async (postId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      const res = await api.togglePostLike(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const likedBy = res.liked
              ? [...p.likedBy, user.id]
              : p.likedBy.filter((id) => id !== user.id);
            return { ...p, likesCount: res.likesCount, likedBy };
          }
          return p;
        })
      );
      showToast(res.liked ? 'Liked story!' : 'Unliked story');
    } catch (err: any) {
      showToast(err.message || 'Failed to like story', 'error');
    }
  };

  // Handler: Bookmark Toggle on Feed
  const handleBookmarkToggle = async (postId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      const res = await api.togglePostBookmark(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const bookmarkedBy = res.bookmarked
              ? [...p.bookmarkedBy, user.id]
              : p.bookmarkedBy.filter((id) => id !== user.id);
            return { ...p, bookmarksCount: res.bookmarksCount, bookmarkedBy };
          }
          return p;
        })
      );
      showToast(res.bookmarked ? 'Story saved to bookmarks' : 'Removed from bookmarks');
    } catch (err: any) {
      showToast(err.message || 'Failed to bookmark story', 'error');
    }
  };

  // Handler: Edit Post
  const handleStartEditPost = (post: Post) => {
    setPostToEdit(post);
    setSelectedPost(null);
    setIsWriting(true);
  };

  // Handler: Delete Post from feed
  const handleDeletePost = async (post: Post) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      try {
        await api.deletePost(post.id);
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        showToast('Story deleted successfully');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete story', 'error');
      }
    }
  };

  const handleOpenAuthorProfile = async (authorSnippet: any) => {
    try {
      const data = await api.getAuthor(authorSnippet.id || authorSnippet.username);
      setViewingAuthor(data.author);
      setIsAuthorModalOpen(true);
    } catch {
      setViewingAuthor(authorSnippet);
      setIsAuthorModalOpen(true);
    }
  };

  // Main Render Switching: Editor vs Detail vs Feed
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onOpenNewPost={() => {
          setPostToEdit(null);
          setSelectedPost(null);
          setIsWriting(true);
        }}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        onOpenHome={() => {
          setSelectedPost(null);
          setIsWriting(false);
          setPostToEdit(null);
          setActiveFilter('all');
          setSelectedTag(null);
        }}
        onOpenMyStories={() => {
          setSelectedPost(null);
          setIsWriting(false);
          setPostToEdit(null);
          setActiveFilter('my-stories');
          setSelectedTag(null);
        }}
        onOpenBookmarks={() => {
          setSelectedPost(null);
          setIsWriting(false);
          setPostToEdit(null);
          setActiveFilter('bookmarks');
          setSelectedTag(null);
        }}
        onOpenAuthorProfile={handleOpenAuthorProfile}
        activeFilter={activeFilter}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {isWriting ? (
            /* POST EDITOR / COMPOSER VIEW */
            <PostEditor
              key="editor"
              postToEdit={postToEdit}
              onCancel={() => {
                setIsWriting(false);
                setPostToEdit(null);
              }}
              onSaved={(savedPost) => {
                setIsWriting(false);
                setPostToEdit(null);
                setSelectedPost(savedPost);
                fetchPosts();
              }}
            />
          ) : selectedPost ? (
            /* POST DETAIL / READING VIEW */
            <PostDetail
              key={`post-${selectedPost.id}`}
              post={selectedPost}
              onBack={() => setSelectedPost(null)}
              onSelectAuthor={handleOpenAuthorProfile}
              onSelectTag={(tag) => {
                setSelectedTag(tag);
                setSelectedPost(null);
                setActiveFilter('all');
              }}
              onEditPost={handleStartEditPost}
              onPostDeleted={() => {
                setSelectedPost(null);
                fetchPosts();
              }}
            />
          ) : (
            /* EXPLORE FEED & HOMEPAGE VIEW */
            <div key="feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Publication Hero Banner */}
              {!searchQuery && !selectedTag && activeFilter === 'all' && (
                <div className="mb-10 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-stone-800 relative overflow-hidden">
                  <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-4 border border-amber-400/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Curated Thoughts & Technical Essays</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight leading-tight mb-3">
                      Where ideas meet execution.
                    </h1>

                    <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                      A modern publishing ecosystem for developers, designers, and engineering leaders to share in-depth stories, architectural patterns, and thoughtful discussions.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          if (!user) openAuthModal('register');
                          else {
                            setPostToEdit(null);
                            setIsWriting(true);
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                      >
                        <PenSquare className="w-4 h-4" />
                        <span>Start Writing a Story</span>
                      </button>

                      {!user && (
                        <button
                          onClick={() => openAuthModal('login')}
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-colors"
                        >
                          Sign In / Demo Login
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Platform Live Stats Strip */}
                  <div className="mt-8 pt-6 border-t border-stone-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                    <div>
                      <span className="text-[11px] text-stone-400 uppercase font-mono tracking-wider">Stories</span>
                      <p className="text-lg sm:text-xl font-bold font-serif text-white">{stats.totalPosts}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 uppercase font-mono tracking-wider">Writers</span>
                      <p className="text-lg sm:text-xl font-bold font-serif text-white">{stats.totalUsers}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 uppercase font-mono tracking-wider">Discussions</span>
                      <p className="text-lg sm:text-xl font-bold font-serif text-white">{stats.totalComments}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 uppercase font-mono tracking-wider">Total Likes</span>
                      <p className="text-lg sm:text-xl font-bold font-serif text-white">{stats.totalLikes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter & Topic Bar */}
              <FilterBar
                tags={tags}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
                sortBy={sortBy}
                onSelectSortBy={setSortBy}
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
                isLoggedIn={!!user}
              />

              {/* Feed Status Header */}
              {(selectedTag || searchQuery || activeFilter !== 'all') && (
                <div className="flex items-center justify-between mb-4 bg-stone-100 p-3 rounded-xl border border-stone-200">
                  <span className="text-xs font-semibold text-stone-700">
                    Showing {posts.length} {posts.length === 1 ? 'story' : 'stories'}
                    {selectedTag && ` tagged #${selectedTag}`}
                    {searchQuery && ` matching "${searchQuery}"`}
                    {activeFilter === 'my-stories' && ' authored by you'}
                    {activeFilter === 'bookmarks' && ' in your reading list'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTag(null);
                      setSearchQuery('');
                      setActiveFilter('all');
                    }}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold underline"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Posts Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="bg-white rounded-2xl p-6 border border-stone-200/80 animate-pulse space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-200" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 w-24 bg-stone-200 rounded" />
                          <div className="h-2.5 w-16 bg-stone-200 rounded" />
                        </div>
                      </div>
                      <div className="h-5 w-3/4 bg-stone-200 rounded" />
                      <div className="h-16 w-full bg-stone-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 shadow-2xs max-w-lg mx-auto">
                  <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold font-serif text-stone-800">No stories found</h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                    {activeFilter === 'my-stories'
                      ? 'You have not published any stories yet. Start crafting your first essay!'
                      : activeFilter === 'bookmarks'
                      ? 'You have no saved stories in your reading list. Browse and bookmark articles to read later.'
                      : 'Try broadening your search query or choosing another topic tag.'}
                  </p>
                  {activeFilter === 'my-stories' && (
                    <button
                      onClick={() => {
                        setPostToEdit(null);
                        setIsWriting(true);
                      }}
                      className="mt-5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
                    >
                      <PenSquare className="w-3.5 h-3.5" />
                      <span>Write Your First Story</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onSelect={(p) => setSelectedPost(p)}
                      onSelectAuthor={handleOpenAuthorProfile}
                      onSelectTag={(t) => setSelectedTag(t)}
                      onLikeToggle={handleLikeToggle}
                      onBookmarkToggle={handleBookmarkToggle}
                      onEditPost={handleStartEditPost}
                      onDeletePost={handleDeletePost}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200/80 py-8 mt-16 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-900 text-white font-serif font-bold flex items-center justify-center text-xs">
              C
            </span>
            <span className="font-serif font-bold text-stone-800 text-sm">Chronicle</span>
            <span>— The Modern Publication Platform</span>
          </div>
          <div className="flex items-center gap-4 text-stone-500 font-medium">
            <span>REST API Backend</span>
            <span>•</span>
            <span>JSON File Database</span>
            <span>•</span>
            <span>JWT Authentication</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal />
      <AuthorProfileModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        author={viewingAuthor}
        posts={posts}
        onSelectPost={(p) => {
          setSelectedPost(p);
          setIsAuthorModalOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainBlogApp />
      </AuthProvider>
    </ToastProvider>
  );
}
