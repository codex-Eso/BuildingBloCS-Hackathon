# EcoQuest

## IMPORTANT ##
If redirect link in confirmation email sent when signing up brings user to 404 page not found error, please key in this link and login with that same account registered:
https://building-blocs.netlify.app

**EcoQuest** is a gamified sustainability platform that encourages users to complete eco-friendly quests, earn points, and donate to environmental charities. Built with React and Supabase.

---

## Features

### For Students/Users
- **Quest System** - Complete sustainability challenges to earn points
- **Community Feed** - Share your completed quests with photos and captions
- **Social Engagement** - Like and comment on community posts
- **Rewards/Redeem** - Donate your earned points to environmental charities
- **Profile Management** - Upload profile pictures, customize your bio, and track your stats

### For Admins
- **Quest Management** - Create, edit, and delete quests
- **User Management** - View all registered students and their progress
- **Submission Review** - Approve or reject quest completion submissions
- **Assignment System** - Assign specific quests to individual students or groups

---

## Tech Stack

- **Frontend:** React 19 + Vite
- **Backend:** Supabase (Database, Auth, Storage)
- **Styling:** CSS with custom theming
- **Routing:** React Router DOM

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (for backend services)

### 1. Clone the Repository
```bash
git clone https://github.com/codex-Eso/BuildingBloCS-Hackathon.git
cd BuildingBloCS-Hackathon/hackathon
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
The Supabase configuration is already set up in `src/SupaBase.js`. If you need to use your own Supabase project, update the credentials there.

### 4. Run the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```

---

## Project Structure

```
hackathon/
├── src/
│   ├── assets/          # Images and static assets
│   ├── auth/            # Authentication components & hooks
│   │   ├── AuthProvider.jsx
│   │   ├── useAuth.js
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── components/      # Reusable UI components
│   ├── css/             # Stylesheets
│   │   ├── HomePage.css
│   │   ├── CommunityPage.css
│   │   ├── RedeemPage.css
│   │   ├── ProfilePage.css
│   │   ├── AuthPages.css
│   │   └── AdminDashboard.css
│   ├── pages/           # Page components
│   │   ├── HomePage.jsx
│   │   ├── CommunityPage.jsx
│   │   ├── RedeemPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminSignUp.jsx
│   ├── App.jsx          # Main app with routing
│   ├── main.jsx         # Entry point
│   └── SupaBase.js      # Supabase client configuration
├── supabase/
│   └── schema.sql       # Database schema
└── package.json
```

---

## User Roles

| Role | Access |
|------|--------|
| **Student** | Complete quests, view community, redeem points, manage profile |
| **Admin** | Full dashboard access, manage quests, approve submissions, assign quests |

---

## Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Student login |
| Sign Up | `/signup` | Student registration |
| Admin Login | `/admin/login` | Admin login |
| Home/Quests | `/Homepage` | View and complete quests |
| Community | `/community` | Social feed with posts |
| Redeem | `/redeem` | Donate points to charities |
| Profile | `/profile` | User profile and stats |
| Admin Dashboard | `/admin` | Admin management panel |

---

## 🌍 Supported Charities (For future enhancements)

- Global Reforestation Project
- Ocean Conservation Fund
- Renewable Energy Initiative
- Wildlife Protection Alliance

---

## Team

Built for the BuildingBloCS Hackathon 2025

---

