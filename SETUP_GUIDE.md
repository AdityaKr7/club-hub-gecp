# CLUB HUB GECP - Setup Guide

## Prerequisites
- Firebase Project (V9 SDK)
- Modern web browser
- Code editor (VS Code recommended)

---

## 1. Firebase Configuration

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "CLUB HUB GECP"
3. Enable **Authentication** (Email/Password method)
4. Set up **Firestore Database** (Start in test mode)

### Step 2: Get Firebase Config
1. In Firebase Console → Project Settings
2. Copy the Web App config (contains apiKey, authDomain, projectId, etc.)
3. Paste into `js/auth.js` (lines 16-24)

---

## 2. Create Demo Account (For "Skip Login" Feature)

The Skip Login button uses a demo account for quick testing during the webathon demo.

### Create Demo User in Firebase:
1. Go to Firebase Console → Authentication → Users
2. Click "Add User"
3. Use these credentials:
   - **Email:** `demo@clubhub.local`
   - **Password:** `demo@123456`
4. Click "Create User"

### Complete Demo User Profile:
1. In Firebase Console → Cloud Firestore → Create Collection `students`
2. Add a document with this data:
   ```json
   {
     "user_id": "[DEMO_USER_UID_FROM_FIREBASE]",
     "email": "demo@clubhub.local",
     "full_name": "Demo User",
     "created_at": "[timestamp]",
     "updated_at": "[timestamp]"
   }
   ```

---

## 3. Firestore Database Structure

Create the following collections in Cloud Firestore:

### Collection: `clubs`
```json
{
  "name": "CodeHack Club",
  "description": "For coding enthusiasts",
  "icon": "💻",
  "member_count": 0,
  "created_by": "[admin_user_id]",
  "created_at": "[timestamp]"
}
```

### Collection: `students`
```json
{
  "user_id": "[firebase_auth_uid]",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "[timestamp]",
  "updated_at": "[timestamp]"
}
```

### Collection: `memberships`
```json
{
  "user_id": "[firebase_auth_uid]",
  "club_id": "[club_document_id]",
  "role": "member",  // or "admin"
  "joined_at": "[timestamp]",
  "updated_at": "[timestamp]"
}
```

### Collection: `notices`
```json
{
  "club_id": "[club_document_id]",
  "admin_id": "[admin_user_id]",
  "title": "Notice Title",
  "content": "Notice content here",
  "created_at": "[timestamp]",
  "updated_at": "[timestamp]"
}
```

### Collection: `events`
```json
{
  "club_id": "[club_document_id]",
  "admin_id": "[admin_user_id]",
  "title": "Event Name",
  "description": "Event description",
  "event_date": "[timestamp]",
  "location": "Location",
  "capacity": 100,
  "created_at": "[timestamp]",
  "updated_at": "[timestamp]"
}
```

### Collection: `event_registrations`
```json
{
  "user_id": "[firebase_auth_uid]",
  "event_id": "[event_document_id]",
  "registered_at": "[timestamp]"
}
```

---

## 4. Testing the Application

### With Regular Login:
1. Click "Register" tab
2. Fill in details (email, password, name)
3. Click "Register"
4. Switch to "Login" tab
5. Use registered credentials to login

### With Skip Login (Demo):
1. On Login page, click "Skip Login (Demo)" button
2. App loads with demo user account
3. All features are available for testing
4. **Note:** Demo user will have limited functionality until memberships are set up

---

## 5. Webathon Demo Tips

### Quick Setup for Demo Day:
1. **Have credentials ready** - Keep a notepad with test email/password
2. **Pre-populate sample data** - Create sample clubs in Firestore beforehand
3. **Use Skip Login** - Fastest way to show dashboard during time-constrained demo
4. **Test on mobile** - App is responsive; show mobile view if time permits
5. **Prepare user accounts** - Have 2-3 test accounts ready for showing registration flow

---

## 6. Firestore Security Rules (For Production)

Replace the default test mode rules with these when going to production:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /students/{doc} {
      allow read: if request.auth.uid == resource.data.user_id;
      allow create: if request.auth.uid != null;
    }
    
    // Clubs are readable by all, writable by admins only
    match /clubs/{doc} {
      allow read: if true;
      allow write: if request.auth.uid != null && 
        get(/databases/$(database)/documents/memberships/$(request.auth.uid)_$(doc)).data.role == 'admin';
    }
    
    // Similar rules for other collections...
  }
}
```

---

## 7. Troubleshooting

**"Skip Login (Demo)" not working:**
- Ensure demo account is created in Firebase Authentication
- Check Firebase config credentials in `js/auth.js`
- Check browser console for error messages

**Collections not showing:**
- Verify Firestore Database is created
- Check collection names match exactly (case-sensitive)

**Authentication fails:**
- Verify Firebase config is correct
- Check that Authentication is enabled in Firebase Console
- Ensure "Email/Password" method is enabled

---

## 8. Project Structure

```
CLUB HUB 2/
├── index.html              # Main entry point
├── css/
│   └── styles.css          # All styling (dark theme)
├── js/
│   ├── auth.js             # Firebase authentication
│   ├── db.js               # Firestore operations
│   ├── ui.js               # DOM utilities
│   └── app.js              # Main app orchestrator
└── assets/                 # Images/icons (future)
```

---

**Good luck with your webathon! 🚀**
