import React, { useState, useRef } from 'react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Image as ImageIcon,
  Tag,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  Link2,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  Clock,
  Send,
  X,
} from 'lucide-react';
import { Post } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface PostEditorProps {
  postToEdit?: Post | null;
  onCancel: () => void;
  onSaved: (post: Post) => void;
}

const COVER_PRESETS = [
  {
    label: 'Modern Tech',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Typography & Design',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Code & Backend',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Minimalist Workspace',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Abstract Neon',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  },
];

const SUGGESTED_TAGS = ['Engineering', 'Design', 'Architecture', 'WebDev', 'TypeScript', 'AI', 'Tutorial', 'Career'];

export const PostEditor: React.FC<PostEditorProps> = ({ postToEdit, onCancel, onSaved }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState(postToEdit?.title || '');
  const [excerpt, setExcerpt] = useState(postToEdit?.excerpt || '');
  const [content, setContent] = useState(
    postToEdit?.content ||
      `## Introduction\n\nWrite your thoughts and story here. Support for **bold**, *italic*, blockquotes, and code syntax.\n\n### Key Takeaways\n\n- Point 1\n- Point 2\n\n\`\`\`typescript\n// Code snippet\nconst message = "Hello from Chronicle!";\nconsole.log(message);\n\`\`\`\n`
  );
  const [coverImage, setCoverImage] = useState(postToEdit?.coverImage || COVER_PRESETS[0].url);
  const [customCoverInput, setCustomCoverInput] = useState('');
  const [tags, setTags] = useState<string[]>(postToEdit?.tags || ['Engineering', 'WebDev']);
  const [tagInput, setTagInput] = useState('');
  const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Word count & read time calculation
  const wordsCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = Math.max(1, Math.ceil(wordsCount / 200));

  const handleAddTag = (newTag: string) => {
    const clean = newTag.trim().replace(/^#/, '');
    if (clean && !tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  // Markdown Toolbar helper
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;
    const selected = previous.substring(start, end) || 'text';

    const replacement = `${prefix}${selected}${suffix}`;
    const updated = previous.substring(0, start) + replacement + previous.substring(end);

    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please enter a title for your story', 'error');
      return;
    }

    if (!content.trim()) {
      showToast('Story content cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (postToEdit) {
        const updated = await api.updatePost(postToEdit.id, {
          title,
          excerpt,
          content,
          coverImage,
          tags,
        });
        showToast('Story updated successfully!');
        onSaved(updated);
      } else {
        const created = await api.createPost({
          title,
          excerpt,
          content,
          coverImage,
          tags,
        });
        showToast('Story published to Chronicle!');
        onSaved(created);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save story', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-6"
    >
      {/* Top action header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <button
          id="editor-cancel-btn"
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Exit</span>
        </button>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="hidden sm:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('write')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'write' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 inline mr-1" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'split' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Columns className="w-3.5 h-3.5 inline mr-1" />
              Split
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'preview' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              Preview
            </button>
          </div>

          {/* Publish / Update Button */}
          <button
            id="editor-publish-btn"
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-amber-300" />
            <span>{isSubmitting ? 'Saving...' : postToEdit ? 'Update Story' : 'Publish Story'}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Story Metadata Panel */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
              Story Title *
            </label>
            <input
              id="editor-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of your story..."
              required
              className="w-full text-xl sm:text-2xl font-serif font-bold text-stone-900 placeholder:text-stone-300 border-b border-stone-200 focus:border-stone-900 pb-2 focus:outline-none transition-colors"
            />
          </div>

          {/* Excerpt / Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
              Subtitle / Excerpt (Summary for preview cards)
            </label>
            <input
              id="editor-excerpt-input"
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief 1-2 sentence description of what this story covers..."
              className="w-full text-xs sm:text-sm text-stone-700 placeholder:text-stone-400 border border-stone-200 rounded-xl p-2.5 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Cover Image Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Cover Image</span>
              <span className="text-[11px] text-stone-400 font-normal">Pick a curated preset or enter custom URL</span>
            </label>

            {/* Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shrink-0 transition-all ${
                    coverImage === preset.url
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Custom URL input */}
            <div className="flex gap-2 mt-1">
              <input
                id="editor-custom-cover-input"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 text-xs text-stone-700 border border-stone-200 rounded-xl px-3 py-2 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* Preview Banner */}
            {coverImage && (
              <div className="mt-3 relative h-28 sm:h-36 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-semibold bg-stone-900/80 text-white rounded backdrop-blur-xs">
                  Cover Preview
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              Topics / Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-50 border border-stone-200 rounded-xl">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 text-white text-xs font-medium"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                id="editor-tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                placeholder="Add tag (press Enter)..."
                className="flex-1 min-w-[120px] bg-transparent text-xs p-1 focus:outline-none text-stone-800 placeholder:text-stone-400"
              />
            </div>

            {/* Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2 text-xs">
              <span className="text-[11px] text-stone-400">Suggestions:</span>
              {SUGGESTED_TAGS.filter((st) => !tags.includes(st)).slice(0, 5).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleAddTag(st)}
                  className="text-[11px] text-stone-600 hover:text-stone-900 underline"
                >
                  +{st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Formatting Toolbar */}
          <div className="bg-stone-50 border-b border-stone-200 p-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <span className="w-px h-4 bg-stone-300 mx-0.5" />
              <button
                type="button"
                onClick={() => insertFormatting('## ', '\n')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ', '\n')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <span className="w-px h-4 bg-stone-300 mx-0.5" />
              <button
                type="button"
                onClick={() => insertFormatting('> ', '\n')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('```typescript\n', '\n```')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                title="Code block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- ', '\n')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('1. ', '\n')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[', '](https://example.com)')}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                title="Link"
              >
                <Link2 className="w-4 h-4" />
              </button>
            </div>

            {/* Read Stats */}
            <div className="flex items-center gap-3 text-xs text-stone-500 font-mono pr-2">
              <span>{wordsCount} words</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                ~{estimatedMinutes} min read
              </span>
            </div>
          </div>

          {/* Textarea / Preview Container */}
          <div className="min-h-[420px]">
            {viewMode === 'write' && (
              <textarea
                ref={textareaRef}
                id="editor-content-textarea"
                rows={18}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your markdown story here..."
                required
                className="w-full p-6 text-stone-800 text-base font-mono leading-relaxed bg-white focus:outline-none resize-y"
              />
            )}

            {viewMode === 'preview' && (
              <div className="p-6 prose prose-stone max-w-none prose-headings:font-serif">
                <div className="markdown-body space-y-4 text-stone-800">
                  <Markdown>{content || '*No content to preview*'}</Markdown>
                </div>
              </div>
            )}

            {viewMode === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 min-h-[450px]">
                <textarea
                  ref={textareaRef}
                  id="editor-content-split-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your markdown story here..."
                  className="w-full p-6 text-stone-800 text-sm font-mono leading-relaxed bg-white focus:outline-none resize-none"
                />
                <div className="p-6 prose prose-stone max-w-none prose-headings:font-serif overflow-y-auto max-h-[550px] bg-stone-50/40">
                  <div className="markdown-body space-y-4 text-stone-800 text-sm">
                    <Markdown>{content || '*No content to preview*'}</Markdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
};
