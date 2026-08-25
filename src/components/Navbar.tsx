import React, { useState, useRef, useEffect } from 'react';
import { Feather, PenSquare, Search, Bookmark, BookOpen, LogOut, User as UserIcon, Sparkles, ChevronDown, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  onOpenNewPost: () => void;
  onSelectTag?: (tag: string) => void;
  onSearchChange: (search: string) => void;
  searchQuery: string;
  onOpenMyStories: () => void;
  onOpenBookmarks: () => void;
  onOpenHome: () => void;
  onOpenAuthorProfile: (user: any) => void;
  activeFilter?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewPost,
  onSearchChange,
  searchQuery,
  onOpenMyStories,
  onOpenBookmarks,
  onOpenHome,
  onOpenAuthorProfile,
  activeFilter,
}) => {
  const { user, logout, openAuthModal } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWriteClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      onOpenNewPost();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            id="brand-logo-btn"
            onClick={onOpenHome}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-serif font-bold text-xl shadow-xs group-hover:bg-amber-950 transition-colors">
              C
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-stone-900 group-hover:text-amber-950 transition-colors block leading-tight">
                Chronicle
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 block">
                Journal & Essays
              </span>
            </div>
          </button>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={onOpenHome}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === 'all' || !activeFilter
                  ? 'bg-stone-200/80 text-stone-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Explore
            </button>
            {user && (
              <>
                <button
                  onClick={onOpenMyStories}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeFilter === 'my-stories'
                      ? 'bg-stone-200/80 text-stone-900'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  My Stories
                </button>
                <button
                  onClick={onOpenBookmarks}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeFilter === 'bookmarks'
                      ? 'bg-stone-200/80 text-stone-900'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Saved ({/* indicator */})
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Center: Live Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search stories, topics, keywords..."
              className="w-full pl-10 pr-4 py-2 bg-stone-100/90 hover:bg-stone-100 focus:bg-white border border-stone-200 rounded-full text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/80 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Write Button */}
          <button
            id="write-story-btn"
            onClick={handleWriteClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs sm:text-sm font-medium shadow-xs hover:shadow-sm transition-all active:scale-98"
          >
            <PenSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            <span className="hidden sm:inline">Write Story</span>
            <span className="sm:hidden">Write</span>
          </button>

          {user ? (
            /* Logged in dropdown */
            <div className="relative" ref={menuRef}>
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 transition-all focus:outline-none"
              >
                <img
                  src={user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover bg-stone-200"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-semibold text-stone-800 hidden md:inline max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 text-xs text-stone-700 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <p className="font-bold text-stone-900 truncate">{user.name}</p>
                    <p className="text-stone-500 font-mono text-[11px] truncate">@{user.username}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-700 rounded-full">
                      {user.role === 'admin' ? 'Administrator' : 'Author'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onOpenAuthorProfile(user);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-stone-50 flex items-center gap-2.5 font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-stone-500" />
                    <span>My Profile & Stats</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenMyStories();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-stone-50 flex items-center gap-2.5 font-medium"
                  >
                    <BookOpen className="w-4 h-4 text-stone-500" />
                    <span>My Published Stories</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenBookmarks();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-stone-50 flex items-center gap-2.5 font-medium"
                  >
                    <Bookmark className="w-4 h-4 text-stone-500" />
                    <span>Saved Reading List</span>
                  </button>

                  <div className="border-t border-stone-100 my-1"></div>

                  <button
                    id="user-logout-btn"
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 font-semibold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest actions */
            <div className="flex items-center gap-2">
              <button
                id="navbar-signin-btn"
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
              >
                Sign In
              </button>
              <button
                id="navbar-register-btn"
                onClick={() => openAuthModal('register')}
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-semibold border border-stone-300 hover:border-stone-400 bg-white text-stone-900 hover:bg-stone-50 shadow-2xs transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
