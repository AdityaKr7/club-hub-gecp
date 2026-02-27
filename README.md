# CLUB HUB GECP - Campus Club Management System

A modern, responsive web application for managing college clubs, members, events, and notices. Built with vanilla JavaScript using Firebase/Local Storage with a development mode for easy testing.

## 🎯 Features

- **User Authentication**: Register and login system with demo accounts
- **Club Management**: View and manage multiple college clubs
- **Membership System**: Join clubs, view member roles (Admin/Member)
- **Notices & Updates**: Post and view club-specific notices
- **Event Management**: Create, register, and track events
- **Admin Panel**: Full control for club administrators
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Development Mode**: Built-in demo mode with local storage (no backend required)

## 📋 Quick Start

### 1. Clone the Repository
```bash
https://github.com/AdityaKr7/club-hub-gecp.git
cd CLUB-HUB-GECP
```

### 2. Open in Browser
Simply open `index.html` in a modern web browser:
```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Or use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server
```

Then visit: `http://localhost:8000`

### 3. Use Demo Accounts
The application comes with pre-configured demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `adminch@gmail.com` | `admin1234` |
| Member | `member@gmail.com` | `member1234` |

Or click **"Skip Login (Demo)"** to test the application immediately.

## 🏗️ Project Structure

```
CLUB HUB 2/
├── index.html              # Main HTML file
├── README.md              # This file
├── SETUP_GUIDE.md         # Firebase setup instructions
├── .gitignore             # Git ignore rules
├── css/
│   └── styles.css         # All styling
├── js/
│   ├── app.js            # Main application logic
│   ├── auth.js           # Authentication module
│   ├── db.js             # Database (Firestore/localStorage) operations
│   └── ui.js             # UI helper functions
├── assets/               # Images and media (currently empty)
└── data/                 # Sample data files
```

## ⚙️ Configuration

### Development Mode (Default)
The application runs in **Development Mode** by default, using browser **localStorage** for data persistence. No backend setup required!

To use this mode, keep the following in `js/auth.js`:
```javascript
const DEV_MODE = true;
```

All data is stored in the browser and will persist across sessions.

### Production Mode (Firebase)
To switch to **Firebase** for production:

1. **Set `DEV_MODE = false`** in `js/auth.js`
2. **Update Firebase configuration** in `js/auth.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_FIREBASE_API_KEY",
     authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
     projectId: "YOUR_FIREBASE_PROJECT_ID",
     storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
     messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
     appId: "YOUR_FIREBASE_APP_ID"
   };
   ```

3. **Follow the detailed setup guide**: See [`SETUP_GUIDE.md`](SETUP_GUIDE.md)

## 📚 File Descriptions

### Core Files

- **`index.html`**: Main entry point with authentication UI and application container
- **`js/app.js`**: Application orchestration, event listeners, and workflow management
- **`js/auth.js`**: User authentication (supports both Firebase and local dev mode)
- **`js/db.js`**: Database operations including CRUD for clubs, notices, events, memberships
- **`js/ui.js`**: UI utilities, validation functions, and DOM manipulation helpers
- **`css/styles.css`**: Comprehensive styling with responsive design

### Configuration Files

- **`SETUP_GUIDE.md`**: Complete Firebase setup instructions for production use
- **`.gitignore`**: Prevents committing sensitive files and node_modules

## 🔐 Data Structure

### Collections/Local Storage Keys

1. **`club_hub_users`** - User authentication records
   ```json
   {
     "uid": "unique_user_id",
     "email": "user@example.com",
     "password": "hashed_password",
     "displayName": "User Full Name"
   }
   ```

2. **`club_hub_clubs`** - Club information
   ```json
   {
     "id": "club_1",
     "name": "CodeHack Club",
     "description": "For coding enthusiasts",
     "icon": "💻",
     "member_count": 45,
     "created_at": "2026-01-15"
   }
   ```

3. **`club_hub_memberships`** - User-Club relationships
   ```json
   {
     "id": "mem_1",
     "user_id": "user_1",
     "club_id": "club_1",
     "role": "admin",
     "joined_at": "2026-01-15"
   }
   ```

4. **`club_hub_students`** - Student profiles
   ```json
   {
     "id": "student_1",
     "user_id": "user_1",
     "email": "user@example.com",
     "full_name": "User Name",
     "created_at": "2026-01-15"
   }
   ```

5. **`club_hub_notices`** - Notice/announcements
6. **`club_hub_events`** - Event information
7. **`club_hub_event_registrations`** - Event registrations

## 🚀 Usage Guide

### For Users

1. **Register**: Create a new account with email and password
2. **Login**: Sign in with your credentials
3. **Browse Clubs**: View all available clubs on the dashboard
4. **Join Club**: Click to join any club
5. **View Notices**: See club-specific announcements
6. **Register Events**: Register for club events

### For Club Admins

1. **Access Admin Panel**: Available in the sidebar after login
2. **Manage Club**: Update club details
3. **Post Notices**: Create and publish notices to your club
4. **Create Events**: Organize events for your club members
5. **Manage Members**: View and manage club membership roles

## 🛠️ Troubleshooting

### Data is Not Persisting
- **Dev Mode**: Check browser localStorage limits (usually 5-10MB)
- **Clear localStorage**: Open DevTools → Application → Clear Storage → Apply
- Reload the application

### Login Issues
- Ensure you're using correct credentials
- Check browser console for error messages (F12 → Console)
- Try clearing localStorage and restarting

### Firebase Errors
- Verify your Firebase config is correct
- Check Firebase console for permission errors
- Ensure Firestore Database rules allow read/write for authenticated users

## 📝 Browser Support

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## 🔄 Data Backup & Export

All data in development mode is stored in browser's localStorage. To backup:

1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Export the data manually or use browser export features

For production Firebase data, use Firebase Console → Firestore → Export/Backup

## 📄 License

This project is part of the GECP campus initiative. Please check with your institution for usage guidelines.

## 👥 Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution guidelines.

## 📞 Support

For issues or questions:
1. Check existing GitHub Issues
2. Review the SETUP_GUIDE.md for Firebase setup
3. Check browser console for error messages
4. Ensure you're using a modern, updated browser

## ✨ Changelog

### Version 1.0.0 (Initial Release)
- ✅ User authentication system
- ✅ Club management features
- ✅ Notice system
- ✅ Event management
- ✅ Admin panel
- ✅ Development mode with localStorage
- ✅ Firebase integration ready

---

**Built with ❤️ for Campus Club Management**
