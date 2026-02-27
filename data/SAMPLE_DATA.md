# Sample Data

This document describes the sample data structure and how data is initialized in the application.

## Data Storage

The application uses **localStorage** in development mode to persist data in the browser. The following keys are used:

### 1. Users (`club_hub_users`)
Demo user accounts for testing:

```json
[
  {
    "uid": "user_admin_ch",
    "email": "adminch@gmail.com",
    "password": "admin1234",
    "displayName": "CodeHack Admin"
  },
  {
    "uid": "user_member_ch",
    "email": "member@gmail.com",
    "password": "member1234",
    "displayName": "CodeHack Member"
  }
]
```

### 2. Clubs (`club_hub_clubs`)
Sample clubs available in the system:

```json
[
  {
    "id": "club_1",
    "name": "CodeHack Club",
    "description": "For coding enthusiasts and competitive programmers",
    "icon": "💻",
    "member_count": 45,
    "created_at": "2026-01-15"
  },
  {
    "id": "club_2",
    "name": "Sandhan - Entrepreneurship Club",
    "description": "Business ideas and startup discussions",
    "icon": "🚀",
    "member_count": 32,
    "created_at": "2026-01-20"
  },
  {
    "id": "club_3",
    "name": "Science & Innovation Club",
    "description": "Explore science projects and innovations",
    "icon": "🔬",
    "member_count": 28,
    "created_at": "2026-02-01"
  },
  {
    "id": "club_4",
    "name": "Design & Creativity Hub",
    "description": "Graphic design, UI/UX, and creative arts",
    "icon": "🎨",
    "member_count": 25,
    "created_at": "2026-02-05"
  }
]
```

### 3. Memberships (`club_hub_memberships`)
User relationships with clubs:

```json
[
  {
    "id": "mem_1",
    "user_id": "user_admin_ch",
    "club_id": "club_1",
    "role": "admin",
    "joined_at": "2026-01-15"
  },
  {
    "id": "mem_2",
    "user_id": "user_member_ch",
    "club_id": "club_1",
    "role": "member",
    "joined_at": "2026-01-18"
  }
]
```

### 4. Student Profiles (`club_hub_students`)
User profile information:

```json
[
  {
    "id": "student_1",
    "user_id": "user_admin_ch",
    "email": "adminch@gmail.com",
    "full_name": "CodeHack Admin",
    "created_at": "2026-01-10"
  },
  {
    "id": "student_2",
    "user_id": "user_member_ch",
    "email": "member@gmail.com",
    "full_name": "CodeHack Member",
    "created_at": "2026-01-12"
  }
]
```

### 5. Notices (`club_hub_notices`)
Club announcements and updates:

```json
[
  {
    "id": "notice_1",
    "club_id": "club_1",
    "admin_id": "user_admin_ch",
    "title": "Welcome to CodeHack Club",
    "content": "Great to have you here! Check out our upcoming events.",
    "created_at": "2026-01-16"
  }
]
```

### 6. Events (`club_hub_events`)
Club events and activities:

```json
[
  {
    "id": "event_1",
    "club_id": "club_1",
    "admin_id": "user_admin_ch",
    "title": "Coding Workshop",
    "description": "Learn advanced coding techniques",
    "date": "2026-03-01",
    "time": "14:00",
    "location": "Lab Room 101",
    "max_registrations": 50,
    "created_at": "2026-01-20"
  }
]
```

### 7. Event Registrations (`club_hub_event_registrations`)
User registrations for events:

```json
[
  {
    "id": "reg_1",
    "user_id": "user_member_ch",
    "event_id": "event_1",
    "registered_at": "2026-02-01"
  }
]
```

## Data Initialization

When the application starts:

1. `js/db.js` functions check if data exists in localStorage
2. If data doesn't exist, `initializeLocalStorage()` creates demo data
3. On subsequent visits, existing data is updated/modified

## Adding New Demo Data

To add new demo data:

1. Edit `js/db.js`
2. Locate the `DEMO_CLUBS` array or other demo data
3. Add new entries following the same structure
4. Save and reload the application

## Migrating to Firebase

When switching from development mode to Firebase:

1. Set `DEV_MODE = false` in `js/auth.js`
2. Update Firebase configuration with real credentials
3. Manually create Firestore collections and documents
4. Data will then be fetched from Firebase instead of localStorage

## Testing with Sample Data

To test the application:

1. Open the app in your browser
2. Login with demo credentials:
   - Admin: `adminch@gmail.com` / `admin1234`
   - Member: `member@gmail.com` / `member1234`
3. Explore clubs, notices, and events
4. Create new clubs, notices, or events
5. All changes are saved to localStorage

## Clearing Demo Data

To reset to original demo data:

1. Open Browser DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Click and delete keys starting with `club_hub_`
4. Reload the page
5. Demo data will be re-initialized

## Data Persistence

- **Development Mode**: Data persists in browser localStorage (5-10MB limit)
- **Production**: Data persists in Firebase Firestore (unlimited)

---

For more information about data structure, see [SETUP_GUIDE.md](../SETUP_GUIDE.md)
