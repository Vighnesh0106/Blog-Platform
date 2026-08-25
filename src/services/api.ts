import { User, Post, Comment, AuthResponse, ApiResponse } from '../types.ts';

const TOKEN_KEY = 'chronicle_auth_token';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Error saving token to localStorage', e);
    }
  },
  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error removing token', e);
    }
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  register: async (payload: {
    username: string;
    name: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
  }): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login: async (payload: { identifier: string; password: string }): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async (): Promise<User> => {
    return request<User>('/api/auth/me');
  },

  updateProfile: async (payload: {
    name?: string;
    bio?: string;
    avatar?: string;
    username?: string;
  }): Promise<User> => {
    return request<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Posts
  getPosts: async (params?: {
    tag?: string;
    search?: string;
    authorId?: string;
    bookmarked?: boolean;
    sortBy?: 'newest' | 'popular' | 'trending';
  }): Promise<Post[]> => {
    const searchParams = new URLSearchParams();
    if (params?.tag) searchParams.append('tag', params.tag);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.authorId) searchParams.append('authorId', params.authorId);
    if (params?.bookmarked) searchParams.append('bookmarked', 'true');
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

    const qs = searchParams.toString();
    return request<Post[]>(`/api/posts${qs ? `?${qs}` : ''}`);
  },

  getPost: async (id: string): Promise<Post> => {
    return request<Post>(`/api/posts/${id}`);
  },

  createPost: async (payload: {
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    tags?: string[];
  }): Promise<Post> => {
    return request<Post>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updatePost: async (
    id: string,
    payload: {
      title?: string;
      excerpt?: string;
      content?: string;
      coverImage?: string;
      tags?: string[];
    }
  ): Promise<Post> => {
    return request<Post>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deletePost: async (id: string): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  },

  togglePostLike: async (id: string): Promise<{ liked: boolean; likesCount: number }> => {
    return request<{ liked: boolean; likesCount: number }>(`/api/posts/${id}/like`, {
      method: 'POST',
    });
  },

  togglePostBookmark: async (id: string): Promise<{ bookmarked: boolean; bookmarksCount: number }> => {
    return request<{ bookmarked: boolean; bookmarksCount: number }>(`/api/posts/${id}/bookmark`, {
      method: 'POST',
    });
  },

  // Comments
  getComments: async (postId: string): Promise<Comment[]> => {
    return request<Comment[]>(`/api/posts/${postId}/comments`);
  },

  createComment: async (
    postId: string,
    payload: { content: string; parentId?: string | null }
  ): Promise<Comment> => {
    return request<Comment>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteComment: async (commentId: string): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  toggleCommentLike: async (commentId: string): Promise<{ liked: boolean; likesCount: number }> => {
    return request<{ liked: boolean; likesCount: number }>(`/api/comments/${commentId}/like`, {
      method: 'POST',
    });
  },

  // Tags & Stats
  getTags: async (): Promise<{ name: string; count: number }[]> => {
    return request<{ name: string; count: number }[]>('/api/tags');
  },

  getStats: async (): Promise<{
    totalPosts: number;
    totalUsers: number;
    totalComments: number;
    totalLikes: number;
  }> => {
    return request<{
      totalPosts: number;
      totalUsers: number;
      totalComments: number;
      totalLikes: number;
    }>('/api/stats');
  },

  getAuthor: async (
    id: string
  ): Promise<{
    author: User;
    posts: Post[];
    totalLikes: number;
    totalArticles: number;
  }> => {
    return request<{
      author: User;
      posts: Post[];
      totalLikes: number;
      totalArticles: number;
    }>(`/api/authors/${id}`);
  },
};
