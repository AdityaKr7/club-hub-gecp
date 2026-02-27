/**
 * Database Module
 * Handles Firestore operations OR local storage in dev mode
 */

import { DEV_MODE } from './auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

let db;

if (!DEV_MODE) {
  // Get Firestore instance (uses same Firebase app as auth.js)
  db = getFirestore();
}

// ===== DEVELOPMENT MODE - LOCAL DATA =====
// Sample data for demo purposes
const DEMO_CLUBS = [
  {
    id: 'club_1',
    name: 'CodeHack Club',
    description: 'For coding enthusiasts and competitive programmers',
    icon: '💻',
    member_count: 45,
    created_at: new Date(2026, 0, 15),
  },
  {
    id: 'club_2',
    name: 'Sandhan - Entrepreneurship Club',
    description: 'Business ideas and startup discussions',
    icon: '🚀',
    member_count: 32,
    created_at: new Date(2026, 0, 20),
  },
  {
    id: 'club_3',
    name: 'Science & Innovation Club',
    description: 'Explore science projects and innovations',
    icon: '🔬',
    member_count: 28,
    created_at: new Date(2026, 1, 1),
  },
  {
    id: 'club_4',
    name: 'Design & Creativity Hub',
    description: 'Graphic design, UI/UX, and creative arts',
    icon: '🎨',
    member_count: 25,
    created_at: new Date(2026, 1, 5),
  },
];

function initializeLocalStorage() {
  // Initialize users with predefined credentials
  if (!localStorage.getItem('club_hub_users')) {
    const demoUsers = [
      {
        uid: 'user_admin_ch',
        email: 'adminch@gmail.com',
        password: 'admin1234',
        displayName: 'CodeHack Admin',
      },
      {
        uid: 'user_member_ch',
        email: 'member@gmail.com',
        password: 'member1234',
        displayName: 'CodeHack Member',
      },
    ];
    localStorage.setItem('club_hub_users', JSON.stringify(demoUsers));
  }

  // Initialize student profiles
  if (!localStorage.getItem('club_hub_students')) {
    const demoStudents = [
      {
        id: 'student_1',
        user_id: 'user_admin_ch',
        email: 'adminch@gmail.com',
        full_name: 'CodeHack Admin',
        created_at: new Date(2026, 0, 10),
      },
      {
        id: 'student_2',
        user_id: 'user_member_ch',
        email: 'member@gmail.com',
        full_name: 'CodeHack Member',
        created_at: new Date(2026, 0, 12),
      },
    ];
    localStorage.setItem('club_hub_students', JSON.stringify(demoStudents));
  }

  if (!localStorage.getItem('club_hub_clubs')) {
    localStorage.setItem('club_hub_clubs', JSON.stringify(DEMO_CLUBS));
  }
  if (!localStorage.getItem('club_hub_memberships')) {
    // CodeHack Club memberships
    const demoMemberships = [
      {
        id: 'mem_1',
        user_id: 'user_admin_ch',
        club_id: 'club_1',
        role: 'admin',
        joined_at: new Date(2026, 0, 15),
      },
      {
        id: 'mem_2',
        user_id: 'user_member_ch',
        club_id: 'club_1',
        role: 'member',
        joined_at: new Date(2026, 0, 18),
      },
    ];
    localStorage.setItem('club_hub_memberships', JSON.stringify(demoMemberships));
  } else {
    // Backfill demo memberships if localStorage already exists
    const memberships = JSON.parse(localStorage.getItem('club_hub_memberships') || '[]');
    const clubs = JSON.parse(localStorage.getItem('club_hub_clubs') || '[]');

    const ensureMembership = (userId, clubId, role, joinedAt) => {
      const exists = memberships.some(
        (m) => m.user_id === userId && m.club_id === clubId
      );
      if (!exists) {
        memberships.push({
          id: 'mem_' + Date.now() + '_' + userId,
          user_id: userId,
          club_id: clubId,
          role,
          joined_at: joinedAt,
        });

        const clubIndex = clubs.findIndex((c) => c.id === clubId);
        if (clubIndex !== -1) {
          clubs[clubIndex].member_count = (clubs[clubIndex].member_count || 0) + 1;
        }
      }
    };

    ensureMembership('user_admin_ch', 'club_1', 'admin', new Date(2026, 0, 15));
    ensureMembership('user_member_ch', 'club_1', 'member', new Date(2026, 0, 18));

    localStorage.setItem('club_hub_memberships', JSON.stringify(memberships));
    localStorage.setItem('club_hub_clubs', JSON.stringify(clubs));
  }
  if (!localStorage.getItem('club_hub_notices')) {
    const demoNotices = [
      {
        id: 'notice_1',
        club_id: 'club_1',
        admin_id: 'user_admin_ch',
        title: 'Welcome to CodeHack Club!',
        content:
          'We are excited to have you here. Our first meeting will be held next Friday at 5 PM in the conference room.',
        created_at: new Date(2026, 1, 20),
      },
    ];
    localStorage.setItem('club_hub_notices', JSON.stringify(demoNotices));
  }
  if (!localStorage.getItem('club_hub_events')) {
    const demoEvents = [
      {
        id: 'event_1',
        club_id: 'club_1',
        admin_id: 'user_admin_ch',
        title: 'Coding Hackathon',
        description:
          '24-hour coding competition. Teams of 3-4 members. Prizes worth 10000 rupees!',
        event_date: new Date(2026, 3, 15),
        location: 'Main Campus, Conference Hall',
        capacity: 100,
        created_at: new Date(2026, 1, 15),
      },
    ];
    localStorage.setItem('club_hub_events', JSON.stringify(demoEvents));
  }
}

if (DEV_MODE) {
  initializeLocalStorage();
}

/**
 * Create a student profile (called after registration)
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} fullName - Full name
 * @returns {Promise<Object>} Success status
 */
export async function createStudentProfile(userId, email, fullName) {
  try {
    if (DEV_MODE) {
      const students = JSON.parse(localStorage.getItem('club_hub_students') || '[]');
      students.push({
        id: 'student_' + Date.now(),
        user_id: userId,
        email,
        full_name: fullName,
        created_at: new Date(),
      });
      localStorage.setItem('club_hub_students', JSON.stringify(students));
      return { success: true };
    }

    await addDoc(collection(db, 'students'), {
      user_id: userId,
      email: email,
      full_name: fullName,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating student profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all clubs
 * @returns {Promise<Array>} Array of club objects
 */
export async function getAllClubs() {
  try {
    if (DEV_MODE) {
      const clubs = JSON.parse(localStorage.getItem('club_hub_clubs') || '[]');
      return { success: true, data: clubs };
    }

    const clubsRef = collection(db, 'clubs');
    const q = query(clubsRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);

    const clubs = [];
    querySnapshot.forEach((doc) => {
      clubs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: clubs };
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get club by ID
 * @param {string} clubId - Club ID
 * @returns {Promise<Object>} Club object
 */
export async function getClubById(clubId) {
  try {
    if (DEV_MODE) {
      const clubs = JSON.parse(localStorage.getItem('club_hub_clubs') || '[]');
      const club = clubs.find((c) => c.id === clubId);
      if (club) {
        return { success: true, data: club };
      } else {
        return { success: false, error: 'Club not found', data: null };
      }
    }

    const docRef = doc(db, 'clubs', clubId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data(),
        },
      };
    } else {
      return { success: false, error: 'Club not found', data: null };
    }
  } catch (error) {
    console.error('Error fetching club:', error);
    return { success: false, error: error.message, data: null };
  }
}

/**
 * Check if user is admin of a specific club
 * @param {string} userId - User ID
 * @param {string} clubId - Club ID
 * @returns {Promise<boolean>} True if user is admin
 */
export async function isClubAdmin(userId, clubId) {
  try {
    if (DEV_MODE) {
      const memberships = JSON.parse(localStorage.getItem('club_hub_memberships') || '[]');
      return memberships.some(
        (m) => m.user_id === userId && m.club_id === clubId && m.role === 'admin'
      );
    }

    const membershipsRef = collection(db, 'memberships');
    const q = query(
      membershipsRef,
      where('user_id', '==', userId),
      where('club_id', '==', clubId),
      where('role', '==', 'admin')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if user is member of a specific club
 * @param {string} userId - User ID
 * @param {string} clubId - Club ID
 * @returns {Promise<boolean>} True if user is a member
 */
export async function isClubMember(userId, clubId) {
  try {
    if (DEV_MODE) {
      const memberships = JSON.parse(localStorage.getItem('club_hub_memberships') || '[]');
      return memberships.some((m) => m.user_id === userId && m.club_id === clubId);
    }

    const membershipsRef = collection(db, 'memberships');
    const q = query(membershipsRef, where('user_id', '==', userId), where('club_id', '==', clubId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
}

/**
 * Get user's clubs with their roles
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of clubs with roles
 */
export async function getUserClubs(userId) {
  try {
    if (DEV_MODE) {
      const memberships = JSON.parse(localStorage.getItem('club_hub_memberships') || '[]');
      const clubs = JSON.parse(localStorage.getItem('club_hub_clubs') || '[]');

      const userClubs = memberships
        .filter((m) => m.user_id === userId)
        .map((m) => {
          const club = clubs.find((c) => c.id === m.club_id);
          return {
            ...club,
            userRole: m.role,
            membershipId: m.id,
          };
        });

      return { success: true, data: userClubs };
    }

    const membershipsRef = collection(db, 'memberships');
    const q = query(membershipsRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    const userClubs = [];
    for (const docSnap of querySnapshot.docs) {
      const membership = docSnap.data();
      const clubRes = await getClubById(membership.club_id);
      if (clubRes.success) {
        userClubs.push({
          ...clubRes.data,
          userRole: membership.role,
          membershipId: docSnap.id,
        });
      }
    }

    return { success: true, data: userClubs };
  } catch (error) {
    console.error('Error fetching user clubs:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get notices for a club
 * @param {string} clubId - Club ID
 * @returns {Promise<Array>} Array of notices
 */
export async function getClubNotices(clubId) {
  try {
    if (DEV_MODE) {
      const notices = JSON.parse(localStorage.getItem('club_hub_notices') || '[]');
      return {
        success: true,
        data: notices.filter((n) => n.club_id === clubId).sort((a, b) => b.created_at - a.created_at),
      };
    }

    const noticesRef = collection(db, 'notices');
    const q = query(
      noticesRef,
      where('club_id', '==', clubId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const notices = [];
    querySnapshot.forEach((doc) => {
      notices.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: notices };
  } catch (error) {
    console.error('Error fetching notices:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get all notices across clubs (local-only for now)
 * @returns {Promise<Object>} All notices with club info
 */
export async function getAllNotices() {
  try {
    if (DEV_MODE) {
      const notices = JSON.parse(localStorage.getItem('club_hub_notices') || '[]');
      const clubs = JSON.parse(localStorage.getItem('club_hub_clubs') || '[]');

      const data = notices
        .map((notice) => ({
          ...notice,
          clubName: clubs.find((c) => c.id === notice.club_id)?.name || 'Unknown Club',
          clubIcon: clubs.find((c) => c.id === notice.club_id)?.icon || '🎯',
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return { success: true, data };
    }

    return { success: false, error: 'Not implemented', data: [] };
  } catch (error) {
    console.error('Error fetching all notices:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Create a notice (Admin only)
 * @param {string} clubId - Club ID
 * @param {string} userId - Admin user ID
 * @param {string} title - Notice title
 * @param {string} content - Notice content
 * @returns {Promise<Object>} Success status
 */
export async function createNotice(clubId, userId, title, content) {
  try {
    // Verify user is admin
    const isAdmin = await isClubAdmin(userId, clubId);
    if (!isAdmin) {
      return { success: false, error: 'Only admins can publish notices' };
    }

    if (DEV_MODE) {
      const notices = JSON.parse(localStorage.getItem('club_hub_notices') || '[]');
      notices.push({
        id: 'notice_' + Date.now(),
        club_id: clubId,
        admin_id: userId,
        title,
        content,
        created_at: new Date(),
      });
      localStorage.setItem('club_hub_notices', JSON.stringify(notices));
      return { success: true };
    }

    await addDoc(collection(db, 'notices'), {
      club_id: clubId,
      admin_id: userId,
      title: title,
      content: content,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating notice:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get events for a club
 * @param {string} clubId - Club ID
 * @returns {Promise<Array>} Array of events
 */
export async function getClubEvents(clubId) {
  try {
    if (DEV_MODE) {
      const events = JSON.parse(localStorage.getItem('club_hub_events') || '[]');
      return {
        success: true,
        data: events
          .filter((e) => e.club_id === clubId)
          .sort((a, b) => new Date(b.event_date) - new Date(a.event_date)),
      };
    }

    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('club_id', '==', clubId),
      orderBy('event_date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const events = [];
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Create an event (Admin only)
 * @param {string} clubId - Club ID
 * @param {string} userId - Admin user ID
 * @param {Object} eventData - Event details
 * @returns {Promise<Object>} Success status
 */
export async function createEvent(clubId, userId, eventData) {
  try {
    // Verify user is admin
    const isAdmin = await isClubAdmin(userId, clubId);
    if (!isAdmin) {
      return { success: false, error: 'Only admins can create events' };
    }

    if (DEV_MODE) {
      const events = JSON.parse(localStorage.getItem('club_hub_events') || '[]');
      events.push({
        id: 'event_' + Date.now(),
        club_id: clubId,
        admin_id: userId,
        title: eventData.title,
        description: eventData.description,
        event_date: new Date(eventData.eventDate),
        location: eventData.location,
        capacity: eventData.capacity || null,
        created_at: new Date(),
      });
      localStorage.setItem('club_hub_events', JSON.stringify(events));
      return { success: true };
    }

    await addDoc(collection(db, 'events'), {
      club_id: clubId,
      admin_id: userId,
      title: eventData.title,
      description: eventData.description,
      event_date: new Date(eventData.eventDate),
      location: eventData.location,
      capacity: eventData.capacity || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Register user for an event
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Success status
 */
export async function registerForEvent(userId, eventId) {
  try {
    if (DEV_MODE) {
      const registrations = JSON.parse(
        localStorage.getItem('club_hub_event_registrations') || '[]'
      );
      const events = JSON.parse(localStorage.getItem('club_hub_events') || '[]');

      if (registrations.some((r) => r.user_id === userId && r.event_id === eventId)) {
        return { success: false, error: 'You are already registered for this event' };
      }

      const event = events.find((e) => e.id === eventId);
      if (event && event.capacity) {
        const currentCount = registrations.filter((r) => r.event_id === eventId).length;
        if (currentCount >= event.capacity) {
          return { success: false, error: 'Event capacity is full' };
        }
      }

      registrations.push({
        id: 'reg_' + Date.now(),
        user_id: userId,
        event_id: eventId,
        registered_at: new Date(),
      });
      localStorage.setItem('club_hub_event_registrations', JSON.stringify(registrations));
      return { success: true };
    }

    await addDoc(collection(db, 'event_registrations'), {
      user_id: userId,
      event_id: eventId,
      registered_at: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error registering for event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Join a club (Create membership as regular member)
 * @param {string} userId - User ID
 * @param {string} clubId - Club ID
 * @returns {Promise<Object>} Success status
 */
export async function joinClub(userId, clubId) {
  try {
    // Check if already member
    const isMember = await isClubMember(userId, clubId);
    if (isMember) {
      return { success: false, error: 'You are already a member of this club' };
    }

    if (DEV_MODE) {
      const memberships = JSON.parse(localStorage.getItem('club_hub_memberships') || '[]');
      const clubs = JSON.parse(localStorage.getItem('club_hub_clubs') || '[]');
      memberships.push({
        id: 'mem_' + Date.now(),
        user_id: userId,
        club_id: clubId,
        role: 'member',
        joined_at: new Date(),
      });
      localStorage.setItem('club_hub_memberships', JSON.stringify(memberships));

      const clubIndex = clubs.findIndex((c) => c.id === clubId);
      if (clubIndex !== -1) {
        clubs[clubIndex].member_count = (clubs[clubIndex].member_count || 0) + 1;
        localStorage.setItem('club_hub_clubs', JSON.stringify(clubs));
      }

      return { success: true };
    }

    await addDoc(collection(db, 'memberships'), {
      user_id: userId,
      club_id: clubId,
      role: 'member', // New members join as regular members
      joined_at: new Date(),
      updated_at: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error joining club:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all events across all clubs
 * @returns {Promise<Object>} All events sorted by date
 */
export async function getAllEvents() {
  try {
    if (DEV_MODE) {
      const events = JSON.parse(localStorage.getItem('club_hub_events') || '[]');
      const clubs = JSON.parse(localStorage.getItem('club_hub_clubs') || '[]');
      
      return {
        success: true,
        data: events
          .map((event) => ({
            ...event,
            clubName: clubs.find((c) => c.id === event.club_id)?.name || 'Unknown Club',
            clubIcon: clubs.find((c) => c.id === event.club_id)?.icon || '🎯',
          }))
          .sort((a, b) => new Date(a.event_date) - new Date(b.event_date)),
      };
    }

    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('event_date', 'asc'));
    const querySnapshot = await getDocs(q);

    const events = [];
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('Error fetching all events:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get user's registered events
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's event registrations
 */
export async function getUserEventRegistrations(userId) {
  try {
    if (DEV_MODE) {
      const registrations = JSON.parse(
        localStorage.getItem('club_hub_event_registrations') || '[]'
      );
      const events = JSON.parse(localStorage.getItem('club_hub_events') || '[]');

      const userRegistrations = registrations.filter((r) => r.user_id === userId);
      const eventIds = userRegistrations.map((r) => r.event_id);

      return {
        success: true,
        data: events.filter((e) => eventIds.includes(e.id)),
      };
    }

    const registrations = [];
    const regsRef = collection(db, 'event_registrations');
    const q = query(regsRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      registrations.push(doc.data().event_id);
    });

    return { success: true, data: registrations };
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Check if user is registered for an event
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @returns {Promise<boolean>} Registration status
 */
export async function isUserRegisteredForEvent(userId, eventId) {
  try {
    if (DEV_MODE) {
      const registrations = JSON.parse(
        localStorage.getItem('club_hub_event_registrations') || '[]'
      );
      return registrations.some((r) => r.user_id === userId && r.event_id === eventId);
    }

    const registrations = [];
    const regsRef = collection(db, 'event_registrations');
    const q = query(regsRef, where('user_id', '==', userId), where('event_id', '==', eventId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Error checking registration:', error);
    return false;
  }
}

/**
 * Get club details with members and notices
 * @param {string} clubId - Club ID
 * @returns {Promise<Object>} Club details
 */
export async function getClubDetails(clubId) {
  try {
    if (DEV_MODE) {
      const clubs = JSON.parse(localStorage.getItem('club_hub_clubs') || '[]');
      const memberships = JSON.parse(localStorage.getItem('club_hub_memberships') || '[]');
      const notices = JSON.parse(localStorage.getItem('club_hub_notices') || '[]');
      const students = JSON.parse(localStorage.getItem('club_hub_students') || '[]');

      const club = clubs.find((c) => c.id === clubId);
      const members = memberships
        .filter((m) => m.club_id === clubId)
        .map((m) => ({
          ...m,
          studentName: students.find((s) => s.user_id === m.user_id)?.full_name || 'Unknown',
        }));
      const clubNotices = notices.filter((n) => n.club_id === clubId);

      return {
        success: true,
        data: {
          ...club,
          members,
          notices: clubNotices,
        },
      };
    }

    // Firebase implementation would go here
    return { success: false, error: 'Not implemented' };
  } catch (error) {
    console.error('Error fetching club details:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update club details (local-only for now)
 * @param {string} clubId - Club ID
 * @param {Object} updates - Club updates
 * @returns {Promise<Object>} Success status
 */
export async function updateClubDetails(clubId, updates) {
  try {
    if (DEV_MODE) {
      const clubs = JSON.parse(localStorage.getItem('club_hub_clubs') || '[]');
      const clubIndex = clubs.findIndex((c) => c.id === clubId);
      if (clubIndex === -1) {
        return { success: false, error: 'Club not found' };
      }

      clubs[clubIndex] = {
        ...clubs[clubIndex],
        name: updates.name || clubs[clubIndex].name,
        description: updates.description || clubs[clubIndex].description,
        icon: updates.icon || clubs[clubIndex].icon,
      };
      localStorage.setItem('club_hub_clubs', JSON.stringify(clubs));
      return { success: true };
    }

    return { success: false, error: 'Not implemented' };
  } catch (error) {
    console.error('Error updating club:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update member role (local-only for now)
 * @param {string} membershipId - Membership ID
 * @param {string} role - New role
 * @returns {Promise<Object>} Success status
 */
export async function updateMemberRole(membershipId, role) {
  try {
    if (DEV_MODE) {
      const memberships = JSON.parse(localStorage.getItem('club_hub_memberships') || '[]');
      const membershipIndex = memberships.findIndex((m) => m.id === membershipId);
      if (membershipIndex === -1) {
        return { success: false, error: 'Membership not found' };
      }

      memberships[membershipIndex].role = role;
      localStorage.setItem('club_hub_memberships', JSON.stringify(memberships));
      return { success: true };
    }

    return { success: false, error: 'Not implemented' };
  } catch (error) {
    console.error('Error updating member role:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a member from club (local-only for now)
 * @param {string} membershipId - Membership ID
 * @returns {Promise<Object>} Success status
 */
export async function removeMember(membershipId) {
  try {
    if (DEV_MODE) {
      const memberships = JSON.parse(localStorage.getItem('club_hub_memberships') || '[]');
      const clubs = JSON.parse(localStorage.getItem('club_hub_clubs') || '[]');
      const membership = memberships.find((m) => m.id === membershipId);

      const updatedMemberships = memberships.filter((m) => m.id !== membershipId);
      localStorage.setItem('club_hub_memberships', JSON.stringify(updatedMemberships));

      if (membership) {
        const clubIndex = clubs.findIndex((c) => c.id === membership.club_id);
        if (clubIndex !== -1) {
          clubs[clubIndex].member_count = Math.max(
            0,
            (clubs[clubIndex].member_count || 0) - 1
          );
          localStorage.setItem('club_hub_clubs', JSON.stringify(clubs));
        }
      }

      return { success: true };
    }

    return { success: false, error: 'Not implemented' };
  } catch (error) {
    console.error('Error removing member:', error);
    return { success: false, error: error.message };
  }
}

// Export db instance for other modules
export { db };
