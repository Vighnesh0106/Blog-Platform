import React from 'react';
import { Sparkles, TrendingUp, Clock, Flame, Tag, X, Filter } from 'lucide-react';

interface FilterBarProps {
  tags: { name: string; count: number }[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  sortBy: 'newest' | 'popular' | 'trending';
  onSelectSortBy: (sort: 'newest' | 'popular' | 'trending') => void;
  activeFilter: 'all' | 'my-stories' | 'bookmarks';
  onSelectFilter: (filter: 'all' | 'my-stories' | 'bookmarks') => void;
  isLoggedIn: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  tags,
  selectedTag,
  onSelectTag,
  sortBy,
  onSelectSortBy,
  activeFilter,
  onSelectFilter,
  isLoggedIn,
}) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Top Filter Bar: Tabs + Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
        {/* Main Feed Views */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => {
              onSelectFilter('all');
              onSelectTag(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'all' && !selectedTag
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            All Stories
          </button>

          {isLoggedIn && (
            <>
              <button
                onClick={() => {
                  onSelectFilter('my-stories');
                  onSelectTag(null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === 'my-stories'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                My Stories
              </button>
              <button
                onClick={() => {
                  onSelectFilter('bookmarks');
                  onSelectTag(null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === 'bookmarks'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                Saved List
              </button>
            </>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 bg-stone-100/90 p-1 rounded-xl border border-stone-200/60 text-xs">
          <button
            onClick={() => onSelectSortBy('newest')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              sortBy === 'newest' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Latest</span>
          </button>
          <button
            onClick={() => onSelectSortBy('trending')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              sortBy === 'trending' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => onSelectSortBy('popular')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              sortBy === 'popular' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Top Rated</span>
          </button>
        </div>
      </div>

      {/* Topic/Tags Chips row */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-medium shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Topics:
          </span>

          {selectedTag && (
            <button
              onClick={() => onSelectTag(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-semibold border border-amber-300 shrink-0"
            >
              <span>#{selectedTag}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {tags.map((t) => {
            const isSelected = selectedTag?.toLowerCase() === t.name.toLowerCase();
            return (
              <button
                key={t.name}
                onClick={() => onSelectTag(isSelected ? null : t.name)}
                className={`px-2.5 py-1 rounded-lg font-medium border shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                #{t.name} <span className="text-[10px] text-stone-400 ml-0.5">({t.count})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
