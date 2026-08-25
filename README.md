# Chronicle — Modern Full-Stack Blogging Platform

Chronicle is a full-stack publication and blogging web application crafted with React 19, TypeScript, Express, Tailwind CSS, and persistent database storage. It delivers an editorial reading experience with secure user authentication, markdown story composition, and threaded discussions.

---

## 🌟 Key Features

### 1. User Registration, Authentication & Profiles
- **JWT & Password Security**: Secure user registration and login with bcrypt password hashing and token-based session verification.
- **Author Profiles & Customization**: Customizable user profile containing display name, unique username, bio, custom avatar URL, and aggregate metrics (total published stories, received likes).
- **1-Click Quick Demo Accounts**: Instant test login buttons for pre-seeded user personas (Staff Engineer, UI/UX Designer, Cloud Architect) as well as full custom account registration.

### 2. Post Management & Markdown Editor
- **Full CRUD Operations**: Create, read, update, and delete blog posts with author/admin permission validation.
- **Rich Markdown Composer**:
  - Full support for standard Markdown syntax (headings, bold, italics, quotes, code blocks, lists, links).
  - One-click formatting toolbar.
  - Interactive view modes: **Write**, **Live Preview**, and side-by-side **Split View**.
  - Dynamic word counter and reading time estimation.
- **Categorization & Media**: Tagging system with curated suggestions, custom cover image URLs, and pre-selected cover templates.

### 3. Interactive Discussion & Social Features
- **Threaded Comment Section**: Users can publish responses, create nested replies to other comments, and like comments.
- **Story Likes & Bookmarks**: Real-time optimistic likes and personal bookmarks for saved reading lists.
- **Search & Discovery**:
  - Real-time search across titles, summaries, contents, and tags.
  - Topic tag filtering with story counts.
  - Multi-criteria sorting (**Latest**, **Trending**, and **Top Rated**).

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion (`motion/react`)
- **Markdown Rendering**: `react-markdown`

### Backend & API
- **Server**: Express (Node.js) with TypeScript runtime (`tsx` / `esbuild`)
- **Authentication**: `jsonwebtoken` (JWT) + `bcryptjs`
- **Data Persistence**: Atomic, persistent JSON database engine (`/data/blog-db.json`)
- **Architecture**: RESTful API endpoints serving structured JSON responses

---

## 📡 RESTful API Reference

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate with email/username & password | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile information (name, bio, avatar) | Yes |

### Blog Posts Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/posts` | List posts (supports `tag`, `search`, `authorId`, `bookmarked`, `sortBy`) | Optional |
| `GET` | `/api/posts/:id` | Get single post details and metadata | No |
| `POST` | `/api/posts` | Create and publish a new story | Yes |
| `PUT` | `/api/posts/:id` | Edit an existing story | Yes (Author/Admin) |
| `DELETE` | `/api/posts/:id` | Delete a story and its comments | Yes (Author/Admin) |
| `POST` | `/api/posts/:id/like` | Toggle like on a story | Yes |
| `POST` | `/api/posts/:id/bookmark` | Toggle bookmark on a story | Yes |

### Comments Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/posts/:id/comments` | List all comments and nested replies for a post | No |
| `POST` | `/api/posts/:id/comments` | Post a new comment or reply (`parentId`) | Yes |
| `DELETE` | `/api/comments/:id` | Delete a comment | Yes (Author/Admin) |
| `POST` | `/api/comments/:id/like` | Toggle like on a comment | Yes |

### Discovery & Analytics Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tags` | List all topic tags with post frequency counts | No |
| `GET` | `/api/stats` | Platform metrics (total posts, users, comments, likes) | No |
| `GET` | `/api/authors/:id` | Author details and their published stories | No |

---

## 📂 Project Directory Structure

```text
├── data/
│   └── blog-db.json              # Persistent database store
├── server/
│   └── db.ts                     # Database interface, seed loader, and mutations
├── server.ts                     # Express server, JWT middleware, & REST endpoints
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx         # Sign in & Registration modal with demo logins
│   │   ├── AuthorProfileModal.tsx # Author details, bio, & published stories
│   │   ├── CommentsSection.tsx   # Threaded response tree & reply composer
│   │   ├── FilterBar.tsx         # Topic tags, views, and sort selectors
│   │   ├── Navbar.tsx            # Global brand header, search bar, & user menu
│   │   ├── PostCard.tsx          # Feed item card with tags & action metrics
│   │   ├── PostDetail.tsx        # Reading view with markdown body & actions
│   │   └── PostEditor.tsx        # Markdown editor, preview modes & presets
│   ├── context/
│   │   ├── AuthContext.tsx       # Auth state, login/register, token management
│   │   └── ToastContext.tsx      # System feedback notifications
│   ├── services/
│   │   └── api.ts                # Client-side typed API request helper
│   ├── types.ts                  # Shared TypeScript interfaces & types
│   ├── App.tsx                   # Main application orchestrator
│   ├── index.css                 # Global styles and Tailwind configuration
│   └── main.tsx                  # React DOM entry point
├── package.json                  # Scripts & dependencies
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite build and middleware configuration
```

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm** or **yarn**

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with Express backend routing and Vite client middleware.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🧪 Default Test Accounts

You can log in directly using the 1-click buttons in the Sign In modal or with the credentials below:

| Name | Email | Password | Role |
|---|---|---|---|
| **Alex Rivera** | `alex@example.com` | `password123` | Admin |
| **Sarah Chen** | `sarah@example.com` | `password123` | Author |
| **David Kim** | `david@example.com` | `password123` | Author |

---

## 📄 License
This project is licensed under the Apache 2.0 License.
