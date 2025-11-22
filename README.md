# Airbnb Clone Frontend

A modern, production-ready frontend application for an Airbnb-style guest house booking platform, built with React Router Framework, TypeScript, and Chakra UI.

## 🚀 Features

- 🏠 **Room Listings**: Browse available rooms with responsive grid layout
- 📸 **Room Details**: View detailed room information with photo galleries
- ➕ **Room Upload**: Hosts can create and upload new room listings
- 📷 **Photo Management**: Upload and delete photos for room listings (owner only)
- 👤 **User Authentication**: Login, signup, and social authentication (GitHub, Kakao)
- ⭐ **Reviews**: View and display room reviews
- 📱 **Responsive Design**: Fully responsive layout optimized for mobile and desktop
- 🌓 **Dark Mode**: System-aware color mode support
- 🔒 **Type Safety**: Full TypeScript support with strict typing

## 🛠️ Tech Stack

- **Framework**: [React Router Framework](https://reactrouter.com/) v7
- **Language**: TypeScript
- **UI Library**: [Chakra UI](https://chakra-ui.com/) v3
- **Build Tool**: Vite
- **Validation**: Zod
- **Icons**: React Icons
- **Backend**: Django REST API (separate repository)

## 📋 Prerequisites

- Node.js 18+ and npm
- Django backend server running (see backend repository)

## 🚀 Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Set your API base URL (Django server):

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Important Notes:**
- Use `import.meta.env.VITE_API_BASE_URL` in client code; do not hardcode URLs
- If using HttpOnly cookie-based auth, include `credentials: "include"` in fetch requests
- Configure Django CORS to allow the frontend origin in development and production

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## 📁 Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Navigation, Footer, Modals)
│   ├── rooms/          # Room-related components
│   └── ui/             # UI primitives (Toaster)
├── routes/             # Route components (React Router Framework)
│   ├── home/           # Home page
│   ├── rooms/          # Room pages (list, detail, upload, photos)
│   ├── users/          # User pages
│   └── auth/           # Authentication callbacks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── api.ts          # API client functions
│   ├── auth.ts         # Authentication utilities
│   ├── error.ts        # Error handling
│   └── validation.ts   # Zod validation schemas
├── hooks/              # Custom React hooks
├── theme.ts            # Chakra UI theme configuration
└── root.tsx            # Root component
```

## 🎨 Key Features

### Room Management
- **Room Listing**: Browse rooms with responsive grid layout
- **Room Detail**: View room details with photo gallery, amenities, category, and reviews
- **Room Upload**: Create new room listings with form validation
- **Photo Upload/Delete**: Manage room photos (owner only)

### Authentication
- Email/password login and signup
- Social authentication (GitHub, Kakao)
- Session management with HttpOnly cookies
- CSRF token handling

### UI/UX
- Fully responsive design (mobile-first)
- Dark mode support (system-aware)
- Loading states with skeletons
- Toast notifications for user feedback
- Form validation with Zod

## 🏗️ Building for Production

Create a production build:

```bash
npm run build
```

The build output will be in the `build/` directory:
```
build/
├── client/    # Static assets
└── server/    # Server-side code
```

## 🚢 Deployment

### Using React Router Serve

Start the production server:

```bash
npm start
```

### Docker Deployment

To build and run using Docker:

```bash
docker build -t airbnb-frontend .

# Run the container
docker run -p 3000:3000 airbnb-frontend
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build` and set the required environment variables.

## 🔧 Development Guidelines

### React Router Framework Patterns

- Route components receive `loaderData` as props, not via `useLoaderData()` hook
- Use `Route.ComponentProps` type for component props
- Import route types: `import type { Route } from "./+types/<route-file>";`
- Define loaders: `export async function loader({ request }: Route.LoaderArgs) { return { data }; }`

### Code Style

- Follow early returns and shallow nesting
- Keep files focused and small; extract hooks to `hooks/` and UI to `components/`
- Use Chakra UI components over raw HTML
- Use shared API client utilities over ad-hoc `fetch` calls
- Maintain consistent naming: functions are verbs, variables are nouns

### API Client

All API calls should use the centralized API client in `app/utils/api.ts`:
- Automatically prefixes with `VITE_API_BASE_URL`
- Handles CSRF tokens and cookies
- Includes error handling and logging

## 📝 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run typecheck` - Run TypeScript type checking

## 🔗 Related

- Backend API: Django REST API (separate repository)
- [React Router Documentation](https://reactrouter.com/)
- [Chakra UI Documentation](https://chakra-ui.com/)

---

Built with ❤️ using React Router Framework, TypeScript, and Chakra UI.
