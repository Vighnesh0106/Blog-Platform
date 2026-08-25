import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chronicle_super_secure_jwt_secret_key_2026';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

// Authentication middleware
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid token. Please sign in again.' });
  }
}

// Optional Auth middleware (populates req.user if token is valid, but does not block)
function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch {
      // ignore
    }
  }
  next();
}

function generateToken(user: { id: string; email: string; username: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, name, email, password, bio, avatar } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Username, name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    // Check existing
    if (db.findUserByEmail(email)) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    if (db.findUserByUsername(username)) {
      return res.status(400).json({ success: false, error: 'Username is already taken. Please choose another.' });
    }

    const newUser = db.createUser({
      username,
      name,
      email,
      password,
      avatar,
      bio,
    });

    const token = generateToken(newUser);
    const { passwordHash: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      data: {
        user: userSafe,
        token,
      },
      message: 'Account created successfully!',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Registration failed.' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Email/Username and password are required.' });
    }

    const user = db.findUserByEmail(identifier) || db.findUserByUsername(identifier);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. Please check your details.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid password. Please try again.' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...userSafe } = user;

    return res.json({
      success: true,
      data: {
        user: userSafe,
        token,
      },
      message: 'Welcome back!',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Login failed.' });
  }
});

// Current User Profile
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = db.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const { passwordHash: _, ...userSafe } = user;
    return res.json({ success: true, data: userSafe });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update Profile
app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, bio, avatar, username } = req.body;

    if (username) {
      const existing = db.findUserByUsername(username);
      if (existing && existing.id !== req.user!.id) {
        return res.status(400).json({ success: false, error: 'Username is already taken' });
      }
    }

    const updated = db.updateUser(req.user!.id, { name, bio, avatar, username });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { passwordHash: _, ...userSafe } = updated;
    return res.json({ success: true, data: userSafe, message: 'Profile updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// BLOG POSTS ROUTES
// ----------------------------------------------------

// List Posts (with search, tag, author, bookmarked, sort filters)
app.get('/api/posts', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tag, search, authorId, bookmarked, sortBy } = req.query;

    let bookmarkedByUserId: string | undefined = undefined;
    if (bookmarked === 'true') {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Sign in to view bookmarked posts' });
      }
      bookmarkedByUserId = req.user.id;
    }

    const posts = db.getPosts({
      tag: tag as string,
      search: search as string,
      authorId: authorId as string,
      bookmarkedByUserId,
      sortBy: sortBy as any,
    });

    return res.json({ success: true, data: posts });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get Single Post
app.get('/api/posts/:id', (req: Request, res: Response) => {
  try {
    const post = db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    return res.json({ success: true, data: post });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create Post
app.post('/api/posts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, excerpt, content, coverImage, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required to publish a post.' });
    }

    const newPost = db.createPost({
      title,
      excerpt,
      content,
      coverImage,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',') : []),
      authorId: req.user!.id,
    });

    const fullPost = db.getPostById(newPost.id);
    return res.status(201).json({ success: true, data: fullPost, message: 'Post published successfully!' });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create post' });
  }
});

// Update Post
app.put('/api/posts/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, excerpt, content, coverImage, tags } = req.body;

    const updated = db.updatePost(req.params.id, req.user!.id, {
      title,
      excerpt,
      content,
      coverImage,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',') : undefined),
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const fullPost = db.getPostById(updated.id);
    return res.json({ success: true, data: fullPost, message: 'Post updated successfully!' });
  } catch (error: any) {
    console.error('Error updating post:', error);
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: error.message || 'Failed to update post' });
  }
});

// Delete Post
app.delete('/api/posts/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deletePost(req.params.id, req.user!.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    return res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Like / Unlike Post
app.post('/api/posts/:id/like', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = db.togglePostLike(req.params.id, req.user!.id);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(error.message === 'Post not found' ? 404 : 500).json({ success: false, error: error.message });
  }
});

// Bookmark / Unbookmark Post
app.post('/api/posts/:id/bookmark', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = db.togglePostBookmark(req.params.id, req.user!.id);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(error.message === 'Post not found' ? 404 : 500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// COMMENTS ROUTES
// ----------------------------------------------------

// List Comments for a Post
app.get('/api/posts/:id/comments', (req: Request, res: Response) => {
  try {
    const comments = db.getCommentsByPostId(req.params.id);
    return res.json({ success: true, data: comments });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Add Comment to Post
app.post('/api/posts/:id/comments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, parentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Comment content cannot be empty.' });
    }

    const comment = db.createComment({
      postId: req.params.id,
      authorId: req.user!.id,
      content,
      parentId,
    });

    return res.status(201).json({ success: true, data: comment, message: 'Comment added!' });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return res.status(error.message === 'Post not found' ? 404 : 500).json({ success: false, error: error.message });
  }
});

// Delete Comment
app.delete('/api/comments/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteComment(req.params.id, req.user!.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }
    return res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Like / Unlike Comment
app.post('/api/comments/:id/like', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = db.toggleCommentLike(req.params.id, req.user!.id);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(error.message === 'Comment not found' ? 404 : 500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// TAGS & STATS & AUTHOR ROUTES
// ----------------------------------------------------

app.get('/api/tags', (_req: Request, res: Response) => {
  try {
    const tags = db.getAllTags();
    return res.json({ success: true, data: tags });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    return res.json({ success: true, data: stats });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/authors/:id', (req: Request, res: Response) => {
  try {
    const author = db.findUserById(req.params.id) || db.findUserByUsername(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, error: 'Author not found' });
    }
    const posts = db.getPosts({ authorId: author.id });
    const { passwordHash: _, ...authorSafe } = author;

    return res.json({
      success: true,
      data: {
        author: authorSafe,
        posts,
        totalLikes: posts.reduce((acc, p) => acc + p.likesCount, 0),
        totalArticles: posts.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// VITE / STATIC SERVING & STARTUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chronicle Blog Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
