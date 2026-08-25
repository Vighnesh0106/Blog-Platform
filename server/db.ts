import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface DBUser {
  id: string;
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  bio?: string;
  role: 'admin' | 'author' | 'reader';
  createdAt: string;
}

export interface DBPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: string;
  tags: string[];
  readTimeMinutes: number;
  likesCount: number;
  likedBy: string[];
  bookmarksCount: number;
  bookmarkedBy: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface DBComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
  parentId?: string | null;
}

export interface DatabaseSchema {
  users: DBUser[];
  posts: DBPost[];
  comments: DBComment[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'blog-db.json');

function calculateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function generateInitialSeed(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);

  const users: DBUser[] = [
    {
      id: 'usr_alex',
      username: 'alexdev',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Staff Engineer & open-source enthusiast. Writing about distributed systems, React, and software craftsmanship.',
      role: 'admin',
      createdAt: '2026-01-10T10:00:00.000Z',
    },
    {
      id: 'usr_sarah',
      username: 'sarah_chen',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      bio: 'Product Designer & UI Engineer passionate about typography, design systems, and delightful micro-interactions.',
      role: 'author',
      createdAt: '2026-01-15T14:30:00.000Z',
    },
    {
      id: 'usr_david',
      username: 'david_k',
      name: 'David Kim',
      email: 'david@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Cloud Architect exploring edge compute, AI inference pipelines, and scalable database architectures.',
      role: 'author',
      createdAt: '2026-02-01T09:15:00.000Z',
    },
  ];

  const posts: DBPost[] = [
    {
      id: 'post_1',
      title: 'Architecting Resilient Modern Web Applications in 2026',
      slug: 'architecting-resilient-modern-web-applications',
      excerpt: 'A deep dive into distributed state, edge computing, and frontend resilient patterns that keep modern platforms fast and dependable under peak load.',
      content: `## The Modern Web Landscape

Building reliable web applications today requires shifting our mindset from monolithic server architectures to flexible, distributed systems. As users demand sub-second latency and zero downtime, the boundaries between client-side compute and edge services continue to blur.

### Key Principles of Resilient Design

1. **Graceful Degradation:** When third-party microservices or analytics fail, your core user experience must remain completely uninterrupted.
2. **Optimistic UI Updates:** Provide immediate visual feedback for user interactions while reconciling state asynchronously in the background.
3. **Smart Data Caching:** Leverage distributed edge caches and browser-level IndexedDB stores to deliver instant navigation.

\`\`\`typescript
// Example: Optimistic mutation handler
async function handleCommentSubmit(postId: string, commentText: string) {
  const optimisticComment = {
    id: 'temp_' + Date.now(),
    content: commentText,
    createdAt: new Date().toISOString(),
    status: 'sending'
  };
  
  // Update state immediately
  setComments(prev => [optimisticComment, ...prev]);
  
  try {
    const saved = await api.postComment(postId, commentText);
    setComments(prev => prev.map(c => c.id === optimisticComment.id ? saved : c));
  } catch (err) {
    // Revert with friendly toast
    setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
    notifyError('Unable to post comment. Please try again.');
  }
}
\`\`\`

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

### Conclusion

Resilience isn't an afterthought; it is an architectural foundation. By embracing failure as a natural condition and designing for fault tolerance, we build experiences that stand the test of scale.`,
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      authorId: 'usr_alex',
      tags: ['Architecture', 'WebDev', 'Engineering', 'Performance'],
      readTimeMinutes: 4,
      likesCount: 28,
      likedBy: ['usr_sarah', 'usr_david'],
      bookmarksCount: 14,
      bookmarkedBy: ['usr_sarah'],
      createdAt: '2026-02-18T10:30:00.000Z',
      updatedAt: '2026-02-18T10:30:00.000Z',
      published: true,
    },
    {
      id: 'post_2',
      title: 'The Art of Typographic Hierarchy in Editorial Interfaces',
      slug: 'the-art-of-typographic-hierarchy',
      excerpt: 'How deliberate font pairing, mathematical scale ratios, and intentional line-heights transform standard reading experiences into captivating editorial journeys.',
      content: `## Why Typography Dictates Attention

When readers land on a blog or essay, their subconscious makes a decision within 200 milliseconds. If the visual rhythm feels cluttered or disjointed, bounce rates skyrocket. Great typography creates an effortless reading cadence that guides the eye naturally from headline to narrative.

### The Modular Scale in Practice

Using a disciplined scale ratio (such as the Major Third 1.25 or Perfect Fourth 1.333) ensures that every heading level maintains optical harmony with the paragraph text.

* **Display Headings (H1):** 36px–48px with tight letter-spacing (-0.02em).
* **Section Headers (H2):** 24px–30px with balanced vertical margin.
* **Body Copy:** 17px–19px with a 1.6 line-height ratio, constrained between 60 and 75 characters per line for optimal scanning.

\`\`\`css
/* Clean Editorial Body Container */
.article-prose {
  font-size: 1.125rem;
  line-height: 1.75;
  color: #27272a;
  max-width: 68ch;
}
\`\`\`

### Color and Negative Space

Contrast is not just about black and white. Subtle off-white backgrounds (#FAFAFA) paired with deep slate text (#18181B) alleviate optical fatigue during extended evening reading sessions.

Give your elements room to breathe. Generous negative space signals confidence and intellectual clarity.`,
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
      authorId: 'usr_sarah',
      tags: ['Design', 'Typography', 'UI/UX', 'CSS'],
      readTimeMinutes: 3,
      likesCount: 35,
      likedBy: ['usr_alex', 'usr_david'],
      bookmarksCount: 22,
      bookmarkedBy: ['usr_alex', 'usr_david'],
      createdAt: '2026-02-20T16:00:00.000Z',
      updatedAt: '2026-02-20T16:00:00.000Z',
      published: true,
    },
    {
      id: 'post_3',
      title: 'Building Scalable Full-Stack TypeScript APIs with Express',
      slug: 'building-scalable-full-stack-typescript-apis',
      excerpt: 'Practical patterns for routing, authentication middleware, error boundaries, and persistent data layering in production Node.js services.',
      content: `## Structuring TypeScript Services for Longevity

Node.js combined with TypeScript gives teams unmatched velocity, provided the code layout maintains clear separation of concerns.

### Essential Layers

1. **Controller / Route Layer:** Parses request parameters and handles HTTP status codes.
2. **Service / Business Layer:** Pure domain logic independent of HTTP frameworks.
3. **Data Access Layer:** Encapsulates database queries, transactions, and schema migrations.

\`\`\`typescript
// Safe JWT verification middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}
\`\`\`

### Testing and Validation

Always validate input payloads at the API boundary using strict schemas before touching the database layer. This eliminates malformed inputs and SQL/NoSQL injection vulnerabilities before they reach domain logic.`,
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      authorId: 'usr_david',
      tags: ['TypeScript', 'NodeJS', 'Backend', 'API'],
      readTimeMinutes: 5,
      likesCount: 19,
      likedBy: ['usr_alex'],
      bookmarksCount: 9,
      bookmarkedBy: ['usr_alex'],
      createdAt: '2026-02-22T08:45:00.000Z',
      updatedAt: '2026-02-22T08:45:00.000Z',
      published: true,
    },
  ];

  const comments: DBComment[] = [
    {
      id: 'cmt_1',
      postId: 'post_1',
      authorId: 'usr_sarah',
      content: 'Spot-on insights regarding graceful degradation! We recently implemented fallback states for our media streaming pipeline and it saved us during a major cloud outage.',
      createdAt: '2026-02-18T14:20:00.000Z',
      likesCount: 5,
      likedBy: ['usr_alex', 'usr_david'],
      parentId: null,
    },
    {
      id: 'cmt_2',
      postId: 'post_1',
      authorId: 'usr_david',
      content: 'Optimistic UI is such a game changer for perceived performance. Great code example showing the revert pattern on error.',
      createdAt: '2026-02-19T09:12:00.000Z',
      likesCount: 3,
      likedBy: ['usr_sarah'],
      parentId: null,
    },
    {
      id: 'cmt_3',
      postId: 'post_2',
      authorId: 'usr_alex',
      content: 'The 68ch line-length rule is something more developers need to take seriously. Reading long paragraphs on ultrawide monitors is brutal without constraints.',
      createdAt: '2026-02-21T11:05:00.000Z',
      likesCount: 8,
      likedBy: ['usr_sarah'],
      parentId: null,
    },
  ];

  return { users, posts, comments };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database file, re-initializing seed:', err);
    }

    const initial = generateInitialSeed();
    this.saveDataDirect(initial);
    return initial;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private persist() {
    this.saveDataDirect(this.data);
  }

  // --- Users ---
  public findUserById(id: string): DBUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): DBUser | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findUserByUsername(username: string): DBUser | undefined {
    return this.data.users.find((u) => u.username.toLowerCase() === username.toLowerCase().trim());
  }

  public createUser(userData: {
    username: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    bio?: string;
  }): DBUser {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);

    const initials = userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}&backgroundColor=0d9488,4f46e5,d97706,e11d48`;

    const newUser: DBUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: userData.username.trim().toLowerCase(),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      passwordHash,
      avatar: userData.avatar || defaultAvatar,
      bio: userData.bio || '',
      role: 'author',
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<{ name: string; avatar: string; bio: string; username: string }>): DBUser | undefined {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return undefined;

    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.avatar !== undefined) user.avatar = updates.avatar.trim();
    if (updates.bio !== undefined) user.bio = updates.bio.trim();
    if (updates.username !== undefined) user.username = updates.username.trim().toLowerCase();

    this.persist();
    return user;
  }

  // --- Posts ---
  public getPosts(options: {
    tag?: string;
    search?: string;
    authorId?: string;
    bookmarkedByUserId?: string;
    sortBy?: 'newest' | 'popular' | 'trending';
  } = {}) {
    let list = [...this.data.posts];

    if (options.tag) {
      const tagLower = options.tag.toLowerCase();
      list = list.filter((p) => p.tags.some((t) => t.toLowerCase() === tagLower));
    }

    if (options.authorId) {
      list = list.filter((p) => p.authorId === options.authorId);
    }

    if (options.bookmarkedByUserId) {
      list = list.filter((p) => p.bookmarkedBy.includes(options.bookmarkedByUserId!));
    }

    if (options.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (options.sortBy === 'popular') {
      list.sort((a, b) => b.likesCount + b.bookmarksCount - (a.likesCount + a.bookmarksCount));
    } else if (options.sortBy === 'trending') {
      list.sort((a, b) => {
        const scoreA = b.likesCount * 2 + this.getCommentsCountForPost(b.id) * 3;
        const scoreB = a.likesCount * 2 + this.getCommentsCountForPost(a.id) * 3;
        return scoreA - scoreB;
      });
    } else {
      // Default: newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list.map((p) => this.hydratePost(p));
  }

  public getPostById(id: string) {
    const post = this.data.posts.find((p) => p.id === id || p.slug === id);
    if (!post) return undefined;
    return this.hydratePost(post);
  }

  public createPost(data: {
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    tags?: string[];
    authorId: string;
  }): DBPost {
    const slug = data.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60) + '-' + Date.now().toString(36);

    const cleanExcerpt = data.excerpt && data.excerpt.trim().length > 0
      ? data.excerpt.trim()
      : data.content.substring(0, 160).replace(/[#*`_]/g, '') + '...';

    const cleanTags = (data.tags || [])
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const newPost: DBPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: data.title.trim(),
      slug,
      excerpt: cleanExcerpt,
      content: data.content,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
      authorId: data.authorId,
      tags: cleanTags.length > 0 ? cleanTags : ['General'],
      readTimeMinutes: calculateReadTime(data.content),
      likesCount: 0,
      likedBy: [],
      bookmarksCount: 0,
      bookmarkedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: true,
    };

    this.data.posts.unshift(newPost);
    this.persist();
    return newPost;
  }

  public updatePost(
    id: string,
    authorId: string,
    updates: Partial<{
      title: string;
      excerpt: string;
      content: string;
      coverImage: string;
      tags: string[];
    }>
  ): DBPost | null {
    const post = this.data.posts.find((p) => p.id === id);
    if (!post) return null;
    if (post.authorId !== authorId) {
      const author = this.findUserById(authorId);
      if (author?.role !== 'admin') {
        throw new Error('Unauthorized to edit this post');
      }
    }

    if (updates.title !== undefined) post.title = updates.title.trim();
    if (updates.excerpt !== undefined) post.excerpt = updates.excerpt.trim();
    if (updates.content !== undefined) {
      post.content = updates.content;
      post.readTimeMinutes = calculateReadTime(updates.content);
    }
    if (updates.coverImage !== undefined) post.coverImage = updates.coverImage;
    if (updates.tags !== undefined) {
      post.tags = updates.tags.map((t) => t.trim().replace(/^#/, '')).filter((t) => t.length > 0);
    }

    post.updatedAt = new Date().toISOString();
    this.persist();
    return post;
  }

  public deletePost(id: string, authorId: string): boolean {
    const index = this.data.posts.findIndex((p) => p.id === id);
    if (index === -1) return false;

    const post = this.data.posts[index];
    if (post.authorId !== authorId) {
      const user = this.findUserById(authorId);
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized to delete this post');
      }
    }

    this.data.posts.splice(index, 1);
    // Delete associated comments
    this.data.comments = this.data.comments.filter((c) => c.postId !== id);
    this.persist();
    return true;
  }

  public togglePostLike(postId: string, userId: string): { liked: boolean; likesCount: number } {
    const post = this.data.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const idx = post.likedBy.indexOf(userId);
    let liked = false;
    if (idx === -1) {
      post.likedBy.push(userId);
      post.likesCount += 1;
      liked = true;
    } else {
      post.likedBy.splice(idx, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
      liked = false;
    }

    this.persist();
    return { liked, likesCount: post.likesCount };
  }

  public togglePostBookmark(postId: string, userId: string): { bookmarked: boolean; bookmarksCount: number } {
    const post = this.data.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const idx = post.bookmarkedBy.indexOf(userId);
    let bookmarked = false;
    if (idx === -1) {
      post.bookmarkedBy.push(userId);
      post.bookmarksCount += 1;
      bookmarked = true;
    } else {
      post.bookmarkedBy.splice(idx, 1);
      post.bookmarksCount = Math.max(0, post.bookmarksCount - 1);
      bookmarked = false;
    }

    this.persist();
    return { bookmarked, bookmarksCount: post.bookmarksCount };
  }

  // --- Comments ---
  public getCommentsByPostId(postId: string) {
    const comments = this.data.comments.filter((c) => c.postId === postId);
    // Sort oldest first or newest first
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return comments.map((c) => {
      const author = this.findUserById(c.authorId);
      return {
        ...c,
        author: {
          id: author?.id || c.authorId,
          name: author?.name || 'Anonymous Reader',
          username: author?.username || 'user',
          avatar: author?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Reader',
          bio: author?.bio || '',
        },
      };
    });
  }

  public createComment(data: {
    postId: string;
    authorId: string;
    content: string;
    parentId?: string | null;
  }) {
    const post = this.data.posts.find((p) => p.id === data.postId);
    if (!post) throw new Error('Post not found');

    const newComment: DBComment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId: data.postId,
      authorId: data.authorId,
      content: data.content.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likedBy: [],
      parentId: data.parentId || null,
    };

    this.data.comments.push(newComment);
    this.persist();

    const author = this.findUserById(data.authorId);
    return {
      ...newComment,
      author: {
        id: author?.id || data.authorId,
        name: author?.name || 'Reader',
        username: author?.username || 'reader',
        avatar: author?.avatar || '',
        bio: author?.bio || '',
      },
    };
  }

  public deleteComment(commentId: string, userId: string): boolean {
    const idx = this.data.comments.findIndex((c) => c.id === commentId);
    if (idx === -1) return false;

    const comment = this.data.comments[idx];
    const post = this.data.posts.find((p) => p.id === comment.postId);
    const user = this.findUserById(userId);

    const isCommentAuthor = comment.authorId === userId;
    const isPostAuthor = post?.authorId === userId;
    const isAdmin = user?.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      throw new Error('Unauthorized to delete this comment');
    }

    // Delete comment and any replies
    this.data.comments = this.data.comments.filter((c) => c.id !== commentId && c.parentId !== commentId);
    this.persist();
    return true;
  }

  public toggleCommentLike(commentId: string, userId: string): { liked: boolean; likesCount: number } {
    const comment = this.data.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error('Comment not found');

    const idx = comment.likedBy.indexOf(userId);
    let liked = false;
    if (idx === -1) {
      comment.likedBy.push(userId);
      comment.likesCount += 1;
      liked = true;
    } else {
      comment.likedBy.splice(idx, 1);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      liked = false;
    }

    this.persist();
    return { liked, likesCount: comment.likesCount };
  }

  public getAllTags(): { name: string; count: number }[] {
    const map: Record<string, number> = {};
    for (const post of this.data.posts) {
      for (const tag of post.tags) {
        map[tag] = (map[tag] || 0) + 1;
      }
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  public getStats() {
    return {
      totalPosts: this.data.posts.length,
      totalUsers: this.data.users.length,
      totalComments: this.data.comments.length,
      totalLikes: this.data.posts.reduce((acc, p) => acc + p.likesCount, 0),
    };
  }

  private getCommentsCountForPost(postId: string): number {
    return this.data.comments.filter((c) => c.postId === postId).length;
  }

  private hydratePost(post: DBPost) {
    const author = this.findUserById(post.authorId);
    return {
      ...post,
      commentCount: this.getCommentsCountForPost(post.id),
      author: {
        id: author?.id || post.authorId,
        name: author?.name || 'Author',
        username: author?.username || 'author',
        avatar: author?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Author',
        bio: author?.bio || '',
      },
    };
  }
}

export const db = new Database();
