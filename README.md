# 🎓 Educational Opportunities Portal (EduPortal)

A state-of-the-art, responsive educational opportunities portal that enables students across India to discover scholarships, hackathons, workshops, and internships. Built with a robust **Node.js/Express** backend, **MongoDB Atlas** database, and a highly responsive, modern glassmorphic frontend.

---

## 🌟 Live Deployments
* **Frontend (GitHub Pages):** [https://amal043.github.io/EduPortal/](https://amal043.github.io/EduPortal/) *(Primary Static Host — uses Render Backend)*
* **Full Stack (Vercel):** [https://ed-portal.vercel.app](https://ed-portal.vercel.app) *(Alternate Serverless Deployment)*
* **Backend API (Render):** [https://eduportal-g63d.onrender.com](https://eduportal-g63d.onrender.com) *(High-availability Server Web Service)*

---

## ✨ Features

### 🔐 Secure JWT Authentication
* **Modern Auth Flow:** User registrations and secure login powered by **Bcrypt.js** (for password hashing) and **JSON Web Tokens (JWT)** for secure sessions.
* **Mock Google Authentication:** A seamless simulation of Google Login allowing instant email-based login or signup directly via Google credentials.
* **Persistent Sessions:** Sessions remain securely stored in browser local storage and verified dynamically using JWT middleware tokens.

### 📊 Interactive Dashboard & Widgets
* **Dynamic Statistics:** Real-time counters showing Saved Opportunities, Applications Tracked, Upcoming Deadlines, and Active Reminders.
* **Drag-and-Drop Layout:** Move and customize dashboard widgets (Deadline Calendar, Education News Feed, Quick Stats, Trending Carousel) in your preferred order.
* **Application Tracker:** Modify status indicators (`Pending`, `Applied`, `Accepted`, `Rejected`) to track real-time progress.

### 🤖 AI Chatbot Assistant
* **Natural Language Queries:** Ask questions about eligibility criteria, due dates, or recommend opportunities based on your state.
* **Interactive Suggestions:** Chat with context-aware responses, quick replies, and personalized recommendation metrics.

### 🌍 State-Based Content & Search
* **Dynamic Search & Autocomplete:** As-you-type search recommendations with a query debouncing mechanism for smooth performance.
* **State Filter:** Select from all Indian States & Union Territories to instantly render state-specific opportunities with national fallback opportunities.
* **Google News Scraper:** An Express-based RSS feed reader that dynamically parses live Google News feeds to display up-to-date educational news.

### 🌙 Dark/Light Theme & Responsive Design
* **Glassmorphic UI:** Smooth blur gradients, translucent overlays, and premium visual components.
* **Dual Theme Toggle:** High-contrast Light Mode and customized dark-slate Dark Mode.
* **100% Responsive Grid:** Optimized layout breakpoints for desktop (large viewports), tablet devices (2-column layouts), and mobile screens (1-column cards and icon-based navigation bars).
* **PWA Caching:** Built-in Service Worker with dynamic caching scope for offline support on mobile.

---

## 🛠️ Architecture & Tech Stack

### Frontend
* **HTML5 & Vanilla CSS3:** Pure modern stylesheets (no bulky frameworks) optimized for speed.
* **ES6+ JavaScript:** Object-oriented design handles application state and dashboard widgets.
* **Service Worker:** Native PWA caching (`service-worker.js`) with dynamic subdirectory path prefixes.

### Backend
* **Node.js & Express:** Scalable RESTful API architecture.
* **Mongoose ODM:** Defines schemas for `User` profiles and baseline `Opportunity` records.

### Database
* **MongoDB Atlas:** Managed cloud database cluster storing user credentials, synced trackers, and seeded opportunity profiles.

---

## 📁 File Structure

```text
EduPortal/
├── api/
│   └── index.js            # Vercel serverless functions entry point
├── models/
│   ├── User.js             # Mongoose Schema for User profiles & Sync Data
│   └── Opportunity.js      # Mongoose Schema for Opportunity profiles
├── server.js               # Main Node.js/Express App and MongoDB connection
├── script.js               # Frontend application state, auth handlers & UI logic
├── performance.js          # Dynamic API routing, lazy loading & debouncers
├── service-worker.js       # PWA caching strategies (relative directory matching)
├── styles.css              # Main layout, animations & theme custom variables
├── dashboard.css           # Grid styles & widgets layouts
├── comparison.css          # Tables for comparison features
└── vercel.json             # Vercel routing rules & configs
```

---

## 🚀 Local Setup & Installation

### Prerequisites
* **Node.js** (v18 or higher recommended)
* A **MongoDB Atlas** database URI connection string

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Amal043/EduPortal.git
   cd EduPortal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and specify the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=8000
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start the local server:**
   ```bash
   npm start
   ```
   * The backend will startup on `http://localhost:8000`.
   * On first connection, baseline opportunities will automatically be seeded into your database.

5. **Run the frontend:**
   * Open `index.html` via a local server (e.g. Live Server extension in VS Code on port 5500).
   * **Note:** `performance.js` will automatically redirect relative `/api` calls from port `5500` to your Express server running on port `8000`!

---

## ⚙️ Environment Variables

When deploying the backend (on Render or Vercel), ensure you configure these environment parameters:

| Variable | Description | Example / Default |
|---|---|---|
| `MONGODB_URI` | Connection string to your MongoDB Atlas database | `mongodb+srv://user:pass@cluster.mongodb.net/...` |
| `PORT` | Local server port (Render assigns this dynamically) | `8000` |
| `JWT_SECRET` | Secret key used to encrypt and verify user JWT sessions | `your_secret_key` |

---

## 🙏 Credits
* **Made With ❤️ BY Amal...**
* **Icon Packs:** [Font Awesome](https://fontawesome.com)
* **Fonts:** [Google Fonts (Poppins)](https://fonts.google.com)
