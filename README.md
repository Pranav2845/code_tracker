# React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## 📁 Project Structure

```
code_tracker/
├── backend/                 # Node.js backend (Express + MongoDB)
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/         # All route handlers
│   │   ├── authController.js
│   │   ├── platformController.js
│   │   ├── problemController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── models/              # Mongoose models
│   │   ├── PlatformAccount.js
│   │   ├── Problem.js
│   │   └── User.js
│   ├── routes/              # Express route definitions
│   │   ├── auth.js
│   │   ├── platform.js
│   │   ├── problem.js
│   │   └── user.js
│   ├── services/            # External API fetch logic
│   │   ├── leetcode.js
│   │   └── codeforces.js
│   ├── utils/
│   │   └── errorHandler.js
│   ├── .env                 # Backend environment variables
│   ├── package.json
│   └── server.js            # Entry point
│
├── public/                  # Static files for frontend
│   └── index.html
│
├── src/                     # React frontend
│   ├── assets/              # Static images/icons/fonts
│   ├── components/          # Shared components
│   │   ├── AppIcon.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── ScrollToTop.jsx
│   │   └── ui/              # Reusable UI atoms/molecules
│   │       ├── Header.jsx
│   │       ├── ActionButton.jsx
│   │       ├── FormInput.jsx
│   │       └── PrivateRoute.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── dashboard/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── BarChart.jsx
│   │   │       ├── LineChart.jsx
│   │   │       ├── MetricCard.jsx
│   │   │       ├── PlatformStatus.jsx
│   │   │       ├── RadarChart.jsx
│   │   │       └── SkeletonCard.jsx
│   │   ├── onboarding/
│   │   │   └── index.jsx
│   │   ├── platform-connection/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── PlatformCard.jsx
│   │   │       ├── ConnectionModal.jsx
│   │   │       └── ActionButton.jsx
│   │   ├── topic-analysis/
│   │   │   └── index.jsx
│   │   └── NotFound.jsx
│   ├── App.jsx              # Axios config + main layout
│   ├── Routes.jsx           # React Router setup
│   ├── index.jsx            # App root render
│   └── styles/              # Tailwind or CSS setup (if separated)
│
├── .env.local               # Frontend environment variables
├── tailwind.config.js       # Tailwind config
├── vite.config.mjs          # Vite config
├── package.json             # Frontend dependencies
└── README.md

```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

Build the application for production:

```bash
npm run build

