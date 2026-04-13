# 🎓 FOSSEE Workshop Booking Portal

> A full-stack web application for coordinators and instructors to organise, propose, and manage academic workshops across India — built with a **React + Vite** frontend and a **Django REST** backend.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
  - [User Roles](#user-roles)
  - [Registration Flow](#registration-flow)
  - [Workshop Lifecycle](#workshop-lifecycle)
- [Pages & Features](#-pages--features)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Backend Setup](#backend-setup-django)
  - [Frontend Setup](#frontend-setup-react--vite)
- [Environment & Configuration](#-environment--configuration)
- [Statistics & Analytics](#-statistics--analytics)

---

## 🌐 Overview

The **FOSSEE Workshop Booking Portal** is a platform where:

- **Coordinators** (college faculty/staff) can browse available workshop types, propose workshop dates, and track the status of their bookings.
- **Instructors** (FOSSEE team) can view incoming workshop proposals, accept or reschedule them, and manage their workshop calendar from a dedicated dashboard.

Email notifications are sent automatically at every key event — registration, proposal, acceptance, and rescheduling.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Styling** | Vanilla CSS (glassmorphism design system, Inter font) |
| **State / Auth** | React Context API + Django session cookies |
| **Backend** | Django 4.x, Django REST (custom JSON views) |
| **Database** | SQLite (development) |
| **Email** | Django `send_mail` via SMTP |
| **Charts** | (Statistics page) — map & pie chart rendering |

---

## 📁 Project Structure

```
workshop_booking/
│
├── manage.py
├── requirements.txt
├── local_settings.py          # Secret key, email config (gitignored)
│
├── workshop_portal/           # Django project settings & root URLs
├── workshop_app/              # Core app — models, forms, API views
│   ├── models.py              # User, Profile, Workshop, WorkshopType, Comment …
│   ├── forms.py               # UserRegistrationForm, WorkshopForm …
│   ├── api_views.py           # All JSON API endpoints
│   ├── api_urls.py            # URL routes for /api/v1/…
│   └── send_mails.py          # Email notification helpers
│
├── statistics_app/            # Statistics & analytics views
├── cms/                       # Django CMS / admin content pages
│
└── frontend/                  # React + Vite SPA
    ├── index.html
    ├── vite.config.js          # Dev proxy → Django :8000
    └── src/
        ├── main.jsx
        ├── App.jsx             # Routes & layout
        ├── index.css           # Global design tokens & utilities
        ├── api/
        │   └── client.js       # Axios instance (CSRF + session)
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── Loader.jsx
        │   ├── ProtectedRoute.jsx
        │   └── StatusBadge.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx   # 3-step registration
            ├── ActivationPage.jsx
            ├── DashboardPage.jsx  # Instructor only
            ├── StatusPage.jsx     # Coordinator workshop list
            ├── ProposePage.jsx
            ├── WorkshopTypesPage.jsx
            ├── WorkshopDetailPage.jsx
            ├── ProfilePage.jsx
            ├── CoordinatorProfilePage.jsx
            └── StatisticsPage.jsx
```

---

## ⚙️ How It Works

### User Roles

| Role | Access |
|---|---|
| **Coordinator** | Register → Browse workshop types → Propose workshops → Track status |
| **Instructor** | Login → Dashboard → Accept / Reschedule proposals → View coordinator profiles |
| **Public** | View workshop types & public statistics (no login needed) |

Role is determined by Django group membership (`instructor` group = instructor, everyone else = coordinator).

---

### Registration Flow

Registration is a **3-step wizard**:

```
Step 1 — Account       Step 2 — Personal       Step 3 — Institute
─────────────────      ──────────────────      ──────────────────────
Username               Title                   Institute / Organisation
Email                  First & Last Name       Department
Password               Phone Number            City / Location
Confirm Password       How did you hear?       State
```

- Each step is **validated client-side** before advancing (no browser native `required` popups).
- On final submit the form data is sent to `POST /api/v1/register/` as a single JSON payload.
- The backend runs Django's `UserRegistrationForm`, creates the user + profile, and sends a **verification email**.
- The user is redirected to `/activate` where they can enter the link from their email.

---

### Workshop Lifecycle

```
Coordinator proposes  →  Instructors notified via email
        ↓
Instructor views on Dashboard  →  Accepts or ignores
        ↓
Status: Pending (0)  →  Confirmed (1)  →  Completed / Cancelled
        ↓
Both parties receive email confirmation with date, type, and contact details
```

An instructor may also **change the date** of an accepted workshop, triggering a new notification to the coordinator.

---

## 📄 Pages & Features

### `/login` — Sign In
- Username + password authentication via Django session.
- Unverified users are redirected to `/activate`.
- Animated two-panel layout with FOSSEE stats on the left.

### `/register` — Create Account
- 3-step wizard with live validation per step.
- Password strength meter (Weak → Strong).
- Account summary preview on Step 3 before final submission.
- Dropdown options (departments, states, titles) fetched dynamically from `GET /api/v1/choices/`.

### `/activate` — Email Verification
- Instructions page after registration.
- Deep-link: visiting `/api/v1/auth/activate/<key>` marks the profile as verified.

### `/status` — My Workshops *(coordinator)*
- Lists all workshops proposed by the logged-in coordinator.
- Shows status badge (Pending / Confirmed / Completed / Cancelled).
- Links to workshop detail page.

### `/dashboard` — Instructor Dashboard *(instructor only)*
- Lists all pending (`status=0`) workshop proposals.
- Accept button → sends confirmation emails to both parties.
- Change Date form with future-date validation.
- Links to coordinator profiles.

### `/propose` — Propose a Workshop *(coordinator)*
- Select a workshop type and desired date.
- Duplicate proposals (same type + date + coordinator) are rejected server-side.
- On success, all instructors are notified by email.

### `/types` — Workshop Types
- Paginated card grid of all available workshop types.
- Click a card to view full description, duration, terms & conditions, and attachments.

### `/workshops/:id` — Workshop Detail
- Full workshop info.
- Comment thread (instructors see all comments; coordinators see public ones only).

### `/profile` — My Profile
- View and edit personal + institute details.

### `/profile/:id` — Coordinator Profile *(instructor only)*
- View a coordinator's details and their full workshop history.

### `/statistics` — Public Analytics
- Map of India showing workshops by state.
- Pie chart of workshops by type.
- Accessible without login.

---

## 🔌 API Reference

All endpoints are under `/api/v1/`. The React frontend communicates via an **Axios client** that automatically attaches the Django CSRF token and sends session cookies.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/auth/csrf/` | Public | Get CSRF token |
| `GET` | `/auth/user/` | Public | Current session user |
| `POST` | `/auth/login/` | Public | Login |
| `POST` | `/auth/logout/` | Any | Logout |
| `GET` | `/auth/activate/<key>` | Public | Verify email |
| `POST` | `/register/` | Public | Create account |
| `GET` | `/choices/` | Public | Form dropdown options |
| `GET` | `/workshops/types/` | Public | List workshop types (paginated) |
| `GET` | `/workshops/types/<id>/` | Public | Workshop type detail |
| `GET` | `/workshops/types/<id>/tnc/` | Public | Terms & Conditions |
| `GET` | `/workshops/status/` | ✅ Login | Workshops for current user |
| `POST` | `/workshops/propose/` | ✅ Coordinator | Propose a new workshop |
| `POST` | `/workshops/accept/<id>/` | ✅ Instructor | Accept a proposal |
| `POST` | `/workshops/change-date/<id>/` | ✅ Instructor | Reschedule a workshop |
| `GET/POST` | `/workshops/<id>/` | ✅ Login | Workshop detail + comments |
| `GET` | `/profile/` | ✅ Login | Own profile |
| `POST` | `/profile/update/` | ✅ Login | Update own profile |
| `GET` | `/profile/<user_id>/` | ✅ Instructor | Coordinator profile |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

---

### Backend Setup (Django)

```bash
# 1. Clone the repository
git clone <repo-url>
cd workshop_booking

# 2. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Copy and configure local settings
copy .sampleenv local_settings.py
# Edit local_settings.py — set SECRET_KEY, EMAIL_* settings

# 5. Apply migrations
python manage.py migrate

# 6. Create a superuser (optional — for Django admin)
python manage.py createsuperuser

# 7. Run the development server
python manage.py runserver
# → Django API available at http://127.0.0.1:8000
```

---

### Frontend Setup (React + Vite)

```bash
# In a new terminal
cd workshop_booking/frontend

# 1. Install Node dependencies
npm install

# 2. Start the dev server
npm run dev
# → React app available at http://localhost:5173
```

The Vite dev server is configured to **proxy** all `/api/` and `/workshop/` requests to `http://localhost:8000`, so both servers work seamlessly together.

> Open **http://localhost:5173** in your browser to use the application.

---

## 🔧 Environment & Configuration

Edit `local_settings.py` (based on `.sampleenv`):

```python
SECRET_KEY = 'your-secret-key-here'

# Email (required for registration verification & notifications)
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'

# Allowed hosts for production
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
```

---

## 📊 Statistics & Analytics

The `/statistics` page is **publicly accessible** and displays:

| Chart | Description |
|---|---|
| **Map of India** | A choropleth showing workshop counts per state |
| **Pie Chart** | Distribution of workshops by workshop type |
| **Instructor Stats** *(login required)* | Monthly workshop counts, upcoming workshops, and coordinator profiles |

Data is served by `statistics_app/views.py` and rendered in the React `StatisticsPage` component.

---

## 📝 Notes

- The Django **admin panel** is available at `/workshop/admin/` for instructors and superusers.
- Password reset uses Django's built-in views at `/workshop/password_reset/`.
- The platform is designed for **Indian academic institutions** — state and department lists reflect this.

---

*Built for the FOSSEE (Free and Open Source Software for Education) initiative, IIT Bombay.*
