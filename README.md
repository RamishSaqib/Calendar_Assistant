# 🗓️ Calendar Assistant

A powerful, AI-driven calendar management tool built with React and Node.js. Connect your Google Calendar and chat with an intelligent assistant that helps you analyze your schedule, manage meeting loads, and protect your focus time.

![Calendar Assistant Preview](https://via.placeholder.com/800x400?text=Calendar+Assistant+Interface)

## ✨ Features

- **Google Calendar Integration**: Securely connect your Google account to view and analyze your events.
- **Dynamic Calendar View**: View your schedule for Today, This Week, or Next Week with automatic event normalization.
- **AI Chat Assistant**: A context-aware assistant (powered by Google Gemini) that can:
  - Analyze your meeting load and suggest improvements.
  - Draft emails to propose meeting times or explain schedule changes.
  - Help you identify focus blocks and workout times.
- **Persistent Auth**: Built-in user persistence using SQLite and JWT, keeping you logged in across sessions.
- **Responsive Design**: Modern, clean UI built with Vanilla CSS and React.

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Vite, React Router.
- **Backend**: Node.js, Express, TypeScript.
- **AI**: Google Generative AI (Gemini).
- **Database**: SQLite (via `better-sqlite3`).
- **Auth**: Google OAuth2, JSON Web Tokens (JWT).

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Cloud Project with Calendar API enabled.
- A Gemini API Key.

### 1. Clone the Repository

```bash
git clone https://github.com/RamishSaqib/Calendar_Assistant.git
cd Calendar_Assistant
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the environment guide:
   ```env
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   JWT_SECRET=your_random_secret
   CLIENT_ORIGIN=http://localhost:5173
   GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback
   LLM_API_KEY=your_gemini_key
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

The app will be running at `http://localhost:5173`.

## 🌐 Deployment

For detailed instructions on how to deploy this application for free using **Vercel** and **Render**, please refer to the [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

## 📄 License

This project is licensed under the MIT License.
