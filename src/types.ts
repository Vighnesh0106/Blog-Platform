export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  role?: 'admin' | 'author' | 'reader';
  createdAt: string;
}

export interface AuthorSnippet {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: string;
  author: AuthorSnippet;
  tags: string[];
  readTimeMinutes: number;
  likesCount: number;
  likedBy: string[];
  bookmarksCount: number;
  bookmarkedBy: string[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: AuthorSnippet;
  content: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
  parentId?: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
