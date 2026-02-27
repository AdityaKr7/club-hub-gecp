/**
 * Main App Module
 * Orchestrates authentication and UI interactions
 * Entry point for the application
 */

import {
  registerUser,
  loginUser,
  logoutUser,
  onAuthChange,
  getCurrentUser,
  demoLogin,
} from './auth.js';

import {
  createStudentProfile,
  getAllClubs,
  getUserClubs,
  getClubNotices,
  getAllNotices,
  createNotice,
  createEvent,
  getAllEvents,
  getUserEventRegistrations,
  isUserRegisteredForEvent,
  registerForEvent,
  getClubDetails,
  updateClubDetails,
  updateMemberRole,
  removeMember,
} from './db.js';

import {
  switchTab,
  showError,
  clearError,
  resetForm,
  hideAuthContainer,
  showAuthContainer,
  showAppContainer,
  hideAppContainer,
  showLoadingSpinner,
  hideLoadingSpinner,
  isValidEmail,
  isValidPassword,
  getFormData,
} from './ui.js';

let currentUser = null;
let allClubs = [];
let userClubs = [];

/**
 * Initialize app - Set up event listeners
 */
function initializeApp() {
  // Tab switching for Auth
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const tabName = button.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Register form submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Skip login button
  const skipLoginBtn = document.getElementById('skip-login-btn');
  if (skipLoginBtn) {
    skipLoginBtn.addEventListener('click', handleSkipLogin);
  }

  // Listen for auth state changes
  onAuthChange(handleAuthStateChange);

  // Navigation sidebar
  setupNavigation();

  // Admin panel tabs
  setupAdminTabs();

  // Admin panel forms
  setupAdminForms();

  // Modal close button
  const closeModalBtn = document.getElementById('close-club-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('club-details-modal').style.display = 'none';
    });
  }

  // Close modal when clicking outside
  const modal = document.getElementById('club-details-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
}

/**
 * Setup sidebar navigation
 */
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      switchSection(section);

      // Update active state
      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');

      // Load data for section
      loadSectionData(section);
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * Setup admin panel tabs
 */
function setupAdminTabs() {
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  adminTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-admin-tab');

      // Remove active from all tabs
      document
        .querySelectorAll('.admin-tab-content')
        .forEach((tab) => tab.classList.remove('active'));
      document
        .querySelectorAll('.admin-tab-btn')
        .forEach((b) => b.classList.remove('active'));

      // Add active to selected
      btn.classList.add('active');
      const tabContent = document.getElementById(`${tabName}-tab`);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
}

/**
 * Setup admin panel forms
 */
function setupAdminForms() {
  // Notice form submission
  const noticeForm = document.getElementById('notice-form');
  if (noticeForm) {
    noticeForm.addEventListener('submit', handleNoticeSubmit);
  }

  // Event form submission
  const eventForm = document.getElementById('event-form');
  if (eventForm) {
    eventForm.addEventListener('submit', handleEventSubmit);
  }
}

/**
 * Switch to a section
 * @param {string} section - Section name
 */
function switchSection(section) {
  document
    .querySelectorAll('.content-section')
    .forEach((sec) => sec.classList.remove('active'));

  const sectionElement = document.getElementById(`${section}-section`);
  if (sectionElement) {
    sectionElement.classList.add('active');
  }
}

/**
 * Load data for a specific section
 * @param {string} section - Section name
 */
async function loadSectionData(section) {
  try {
    switch (section) {
      case 'dashboard':
        await loadDashboardData();
        break;
      case 'clubs':
        await loadAllClubs();
        break;
      case 'my-clubs':
        await loadMyClubs();
        break;
      case 'events':
        await loadAllEvents();
        break;
      case 'notices':
        await loadAllNotices();
        break;
      case 'admin':
        await loadAdminPanel();
        break;
    }
  } catch (error) {
    console.error(`Error loading ${section} section:`, error);
  }
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
  try {
    showLoadingSpinner();

    // Get all clubs
    const clubsRes = await getAllClubs();
    if (clubsRes.success) {
      allClubs = clubsRes.data;
      document.getElementById('total-clubs').textContent = allClubs.length;
    }

    // Get user's clubs
    const userClubsRes = await getUserClubs(currentUser.uid);
    if (userClubsRes.success) {
      userClubs = userClubsRes.data;
      document.getElementById('my-clubs-count').textContent = userClubs.length;
    }

    // Get upcoming events count
    const eventsRes = await getAllEvents();
    if (eventsRes.success) {
      const now = new Date();
      const upcoming = eventsRes.data.filter((event) => new Date(event.event_date) >= now);
      document.getElementById('upcoming-events-count').textContent = upcoming.length;
    }

    // Load recent notices
    await loadRecentNotices();
  } catch (error) {
    console.error('Error loading dashboard:', error);
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Load recent notices from user's clubs
 */
async function loadRecentNotices() {
  try {
    const noticesList = document.getElementById('recent-notices');
    noticesList.innerHTML = ''; // Clear

    let allNotices = [];

    // Get notices from all user's clubs
    for (const club of userClubs.slice(0, 3)) {
      const noticesRes = await getClubNotices(club.id);
      if (noticesRes.success) {
        noticesRes.data.forEach((notice) => {
          allNotices.push({
            ...notice,
            clubName: club.name,
          });
        });
      }
    }

    // Sort by date and show latest 5
    allNotices.sort((a, b) => b.created_at - a.created_at);
    const recentNotices = allNotices.slice(0, 5);

    if (recentNotices.length === 0) {
      noticesList.innerHTML = '<p class="empty-state">No notices yet</p>';
      return;
    }

    noticesList.innerHTML = recentNotices
      .map(
        (notice) => `
      <div class="notice-item">
        <p class="notice-club">${notice.clubName}</p>
        <h4 class="notice-title">${notice.title}</h4>
        <p class="notice-content">${notice.content.substring(0, 150)}...</p>
        <p class="notice-date">
          ${
            notice.created_at
              ? new Date(notice.created_at.seconds * 1000).toLocaleDateString()
              : 'Recently'
          }
        </p>
      </div>
    `
      )
      .join('');
  } catch (error) {
    console.error('Error loading notices:', error);
  }
}

/**
 * Load all clubs
 */
async function loadAllClubs() {
  try {
    showLoadingSpinner();

    const clubsList = document.getElementById('clubs-list');
    clubsList.innerHTML = '';

    const clubsRes = await getAllClubs();
    if (!clubsRes.success) {
      clubsList.innerHTML =
        '<p class="empty-state">Error loading clubs. Please try again.</p>';
      return;
    }

    allClubs = clubsRes.data;

    if (allClubs.length === 0) {
      clubsList.innerHTML = '<p class="empty-state">No clubs available yet</p>';
      return;
    }

    clubsList.innerHTML = allClubs
      .map(
        (club) => `
      <div class="club-card">
        <div class="club-header">
          <div class="club-icon">${club.icon || '🎯'}</div>
          <h3 class="club-name">${club.name}</h3>
          <p class="club-description">${club.description}</p>
        </div>
        <div class="club-body">
          <div class="club-stats">
            <div class="stat-item">
              <p class="stat-item-value">${club.member_count || 0}</p>
              <p class="stat-item-label">Members</p>
            </div>
          </div>
          <div class="club-buttons">
            <button class="btn btn-join-club" data-club-id="${club.id}">
              Join Club
            </button>
            <button class="btn btn-view-club" data-club-id="${club.id}">
              View Details
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join('');

    // Attach event listeners for view details
    document.querySelectorAll('.btn-view-club').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const clubId = btn.getAttribute('data-club-id');
        await openClubDetails(clubId);
      });
    });

    // Attach event listeners for join club
    document.querySelectorAll('.btn-join-club').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const clubId = btn.getAttribute('data-club-id');
        await handleJoinClub(clubId, btn);
      });
    });
  } catch (error) {
    console.error('Error loading clubs:', error);
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Load user's clubs
 */
async function loadMyClubs() {
  try {
    showLoadingSpinner();

    const myClubsList = document.getElementById('my-clubs-list');
    myClubsList.innerHTML = '';

    const userClubsRes = await getUserClubs(currentUser.uid);
    if (!userClubsRes.success) {
      myClubsList.innerHTML =
        '<p class="empty-state">Error loading your clubs</p>';
      return;
    }

    userClubs = userClubsRes.data;

    if (userClubs.length === 0) {
      myClubsList.innerHTML =
        '<p class="empty-state">You haven\'t joined any clubs yet. Go to <strong>Browse Clubs</strong> to find clubs to join!</p>';
      return;
    }

    myClubsList.innerHTML = userClubs
      .map(
        (club) => `
      <div class="club-card">
        <div class="club-header">
          <div class="club-icon">${club.icon || '🎯'}</div>
          <h3 class="club-name">${club.name}</h3>
          <p class="club-description">${club.description}</p>
        </div>
        <div class="club-body">
          <div class="club-stats">
            <div class="stat-item">
              <p class="stat-item-value">${club.member_count || 0}</p>
              <p class="stat-item-label">Members</p>
            </div>
            <div class="stat-item">
              <p class="stat-item-value">${club.userRole === 'admin' ? 'Admin' : 'Member'}</p>
              <p class="stat-item-label">Your Role</p>
            </div>
          </div>
          <div class="club-buttons">
            <button class="btn btn-view-club" data-club-id="${club.id}" style="background: var(--success-color); color: white; border: none; flex: 1;">
              View Details
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join('');

    // Attach event listeners
    document.querySelectorAll('.btn-view-club').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const clubId = btn.getAttribute('data-club-id');
        await openClubDetails(clubId);
      });
    });
  } catch (error) {
    console.error('Error loading my clubs:', error);
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Load all events
 */
async function loadAllEvents() {
  try {
    showLoadingSpinner();

    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = '';

    const eventsRes = await getAllEvents();
    if (!eventsRes.success) {
      eventsList.innerHTML =
        '<p class="empty-state">Error loading events. Please try again.</p>';
      return;
    }

    const events = eventsRes.data;

    if (events.length === 0) {
      eventsList.innerHTML =
        '<p class="empty-state">No upcoming events scheduled</p>';
      return;
    }

    // Get user's registered events
    const userRegsRes = await getUserEventRegistrations(currentUser.uid);
    const registeredEventIds = userRegsRes.success
      ? userRegsRes.data.map((e) => e.id)
      : [];

    eventsList.innerHTML = events
      .map(
        (event) => `
      <div class="event-card">
        <div class="event-header">
          <div class="event-icon">${event.clubIcon || '📅'}</div>
          <div class="event-info">
            <p class="event-club">${event.clubName || 'Club'}</p>
            <h3 class="event-title">${event.title}</h3>
          </div>
        </div>
        <div class="event-body">
          <p class="event-description">${event.description}</p>
          <div class="event-details">
            <div class="detail-item">
              <span class="detail-icon">📍</span>
              <span>${event.location}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">📅</span>
              <span>${new Date(event.event_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}</span>
            </div>
          </div>
          <button class="btn btn-primary btn-register-event" data-event-id="${
            event.id
          }" ${registeredEventIds.includes(event.id) ? 'disabled' : ''}>
            ${registeredEventIds.includes(event.id) ? '✓ Registered' : 'Register Now'}
          </button>
        </div>
      </div>
    `
      )
      .join('');

    // Attach event listeners
    document.querySelectorAll('.btn-register-event:not(:disabled)').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const eventId = btn.getAttribute('data-event-id');
        await handleRegisterEvent(eventId, btn);
      });
    });
  } catch (error) {
    console.error('Error loading events:', error);
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Load all notices
 */
async function loadAllNotices() {
  try {
    showLoadingSpinner();

    const noticesList = document.getElementById('all-notices-list');
    noticesList.innerHTML = '';

    const noticesRes = await getAllNotices();
    if (!noticesRes.success) {
      noticesList.innerHTML =
        '<p class="empty-state">Error loading notices. Please try again.</p>';
      return;
    }

    const notices = noticesRes.data;
    if (notices.length === 0) {
      noticesList.innerHTML = '<p class="empty-state">No notices available</p>';
      return;
    }

    noticesList.innerHTML = notices
      .map(
        (notice) => `
      <div class="notice-item">
        <p class="notice-club">${notice.clubName}</p>
        <h4 class="notice-title">${notice.title}</h4>
        <p class="notice-content">${notice.content}</p>
        <p class="notice-date">${
          notice.created_at
            ? new Date(notice.created_at).toLocaleDateString()
            : 'Recently'
        }</p>
      </div>
    `
      )
      .join('');
  } catch (error) {
    console.error('Error loading notices:', error);
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Handle notice form submission
 * @param {Event} e - Form event
 */
async function handleNoticeSubmit(e) {
  e.preventDefault();

  const clubId = document.getElementById('notice-club').value;
  const title = document.getElementById('notice-title').value.trim();
  const content = document.getElementById('notice-content').value.trim();
  const errorEl = document.getElementById('notice-error');

  // Clear previous errors
  errorEl.textContent = '';
  errorEl.classList.remove('show');

  // Validation
  if (!clubId || !title || !content) {
    errorEl.textContent = 'Please fill in all fields';
    errorEl.classList.add('show');
    return;
  }

  showLoadingSpinner();

  try {
    const result = await createNotice(currentUser.uid, clubId, title, content);

    if (result.success) {
      // Success
      document.getElementById('notice-form').reset();
      errorEl.textContent = '✓ Notice published successfully!';
      errorEl.style.background = 'rgba(16, 185, 129, 0.1)';
      errorEl.style.borderColor = 'var(--success-color)';
      errorEl.style.color = '#6ee7b7';
      errorEl.classList.add('show');

      // Reload dashboard if on dashboard page
      if (document.getElementById('dashboard-section').classList.contains('active')) {
        setTimeout(() => {
          loadDashboardData();
        }, 1500);
      }
    } else {
      errorEl.textContent = result.error || 'Failed to publish notice';
      errorEl.classList.add('show');
    }
  } catch (error) {
    console.error('Error publishing notice:', error);
    errorEl.textContent = 'An error occurred. Please try again.';
    errorEl.classList.add('show');
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Handle event form submission
 * @param {Event} e - Form event
 */
async function handleEventSubmit(e) {
  e.preventDefault();

  const clubId = document.getElementById('event-club').value;
  const title = document.getElementById('event-title').value.trim();
  const description = document.getElementById('event-description').value.trim();
  const eventDate = document.getElementById('event-date').value;
  const location = document.getElementById('event-location').value.trim();
  const errorEl = document.getElementById('event-error');

  // Clear previous errors
  errorEl.textContent = '';
  errorEl.classList.remove('show');

  // Validation
  if (!clubId || !title || !description || !eventDate || !location) {
    errorEl.textContent = 'Please fill in all fields';
    errorEl.classList.add('show');
    return;
  }

  showLoadingSpinner();

  try {
    const result = await createEvent(currentUser.uid, clubId, {
      title,
      description,
      eventDate,
      location,
      capacity: null,
    });

    if (result.success) {
      // Success
      document.getElementById('event-form').reset();
      errorEl.textContent = '✓ Event created successfully!';
      errorEl.style.background = 'rgba(16, 185, 129, 0.1)';
      errorEl.style.borderColor = 'var(--success-color)';
      errorEl.style.color = '#6ee7b7';
      errorEl.classList.add('show');

      // Reload events if on events page
      if (document.getElementById('events-section').classList.contains('active')) {
        setTimeout(() => {
          loadAllEvents();
        }, 1500);
      }
    } else {
      errorEl.textContent = result.error || 'Failed to create event';
      errorEl.classList.add('show');
    }
  } catch (error) {
    console.error('Error creating event:', error);
    errorEl.textContent = 'An error occurred. Please try again.';
    errorEl.classList.add('show');
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Handle event registration
 * @param {string} eventId - Event ID
 * @param {HTMLElement} button - Register button element
 */
async function handleRegisterEvent(eventId, button) {
  button.disabled = true;
  button.textContent = 'Registering...';

  try {
    const result = await registerForEvent(currentUser.uid, eventId);

    if (result.success) {
      button.textContent = '✓ Registered';
      button.style.background = 'var(--success-color)';
      
      // Show success message
      const eventCard = button.closest('.event-card');
      if (eventCard) {
        const tempMsg = document.createElement('div');
        tempMsg.textContent = 'Successfully registered for event!';
        tempMsg.style.cssText =
          'color: var(--success-color); font-size: 13px; margin-top: 10px; text-align: center;';
        button.parentElement.appendChild(tempMsg);
        
        setTimeout(() => {
          tempMsg.remove();
        }, 3000);
      }
    } else {
      button.disabled = false;
      button.textContent = 'Register Now';
      alert(result.error || 'Failed to register for event');
    }
  } catch (error) {
    console.error('Error registering for event:', error);
    button.disabled = false;
    button.textContent = 'Register Now';
    alert('An error occurred. Please try again.');
  }
}

/**
 * Open club details modal
 * @param {string} clubId - Club ID
 */
async function openClubDetails(clubId) {
  try {
    const modal = document.getElementById('club-details-modal');
    const result = await getClubDetails(clubId);

    if (!result.success) {
      console.error('Error loading club details:', result.error);
      return;
    }

    const club = result.data;
    const nameEl = document.getElementById('club-details-name');
    const descEl = document.getElementById('club-details-description');
    const membersListEl = document.getElementById('club-members-list');
    const noticesListEl = document.getElementById('club-notices-list');
    const actionBtn = document.getElementById('club-details-action-btn');
    const adminToolsEl = document.getElementById('club-admin-tools');
    const adminErrorEl = document.getElementById('club-admin-error');
    const editNameEl = document.getElementById('club-edit-name');
    const editDescEl = document.getElementById('club-edit-description');
    const editIconEl = document.getElementById('club-edit-icon');
    const saveClubBtn = document.getElementById('save-club-details');

    // Set header info
    nameEl.textContent = club.name;
    descEl.textContent = club.description;

    // Set modal icon
    const modalIcon = modal.querySelector('.club-icon');
    if (modalIcon) {
      modalIcon.textContent = club.icon || '🎯';
    }

    // Determine admin state
    const isAdmin = club.members?.some(
      (m) => m.user_id === currentUser.uid && m.role === 'admin'
    );

    // Admin tools
    if (isAdmin) {
      adminToolsEl.style.display = 'block';
      adminErrorEl.textContent = '';
      adminErrorEl.classList.remove('show');
      editNameEl.value = club.name || '';
      editDescEl.value = club.description || '';
      editIconEl.value = club.icon || '';

      saveClubBtn.onclick = async () => {
        const updates = {
          name: editNameEl.value.trim(),
          description: editDescEl.value.trim(),
          icon: editIconEl.value.trim(),
        };

        const saveRes = await updateClubDetails(clubId, updates);
        if (!saveRes.success) {
          adminErrorEl.textContent = saveRes.error || 'Failed to update club';
          adminErrorEl.classList.add('show');
          return;
        }

        nameEl.textContent = updates.name || nameEl.textContent;
        descEl.textContent = updates.description || descEl.textContent;
        if (modalIcon) {
          modalIcon.textContent = updates.icon || modalIcon.textContent;
        }

        adminErrorEl.textContent = '✓ Club updated successfully';
        adminErrorEl.style.background = 'rgba(16, 185, 129, 0.1)';
        adminErrorEl.style.borderColor = 'var(--success-color)';
        adminErrorEl.style.color = '#6ee7b7';
        adminErrorEl.classList.add('show');

        if (document.getElementById('clubs-section').classList.contains('active')) {
          loadAllClubs();
        }
        if (document.getElementById('my-clubs-section').classList.contains('active')) {
          loadMyClubs();
        }
        if (document.getElementById('admin-section').classList.contains('active')) {
          loadAdminPanel();
        }
      };
    } else {
      adminToolsEl.style.display = 'none';
    }

    // Populate members
    if (!club.members || club.members.length === 0) {
      membersListEl.innerHTML = '<p class="empty-state">No members yet</p>';
    } else {
      membersListEl.innerHTML = club.members
        .map(
          (member) => `
        <div class="member-item">
          <div class="member-name">${member.studentName}</div>
          <div class="member-role">${member.role === 'admin' ? '👑 Admin' : '👤 Member'}</div>
          ${
            isAdmin && member.user_id !== currentUser.uid
              ? `<div class="member-actions">
                  <button class="btn-sm primary member-action" data-action="${
                    member.role === 'admin' ? 'make-member' : 'make-admin'
                  }" data-membership-id="${member.id}">
                    ${member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                  </button>
                  <button class="btn-sm danger member-action" data-action="remove" data-membership-id="${member.id}">
                    Remove
                  </button>
                </div>`
              : ''
          }
        </div>
      `
        )
        .join('');

      if (isAdmin) {
        membersListEl.querySelectorAll('.member-action').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const membershipId = btn.getAttribute('data-membership-id');
            const action = btn.getAttribute('data-action');
            await handleMemberAction(clubId, membershipId, action);
          });
        });
      }
    }

    // Populate notices
    if (!club.notices || club.notices.length === 0) {
      noticesListEl.innerHTML = '<p class="empty-state">No notices yet</p>';
    } else {
      noticesListEl.innerHTML = club.notices
        .map(
          (notice) => `
        <div class="notice-item">
          <div class="notice-title">${notice.title}</div>
          <div class="notice-content">${notice.content}</div>
          <div class="notice-date">${
            notice.created_at
              ? new Date(notice.created_at).toLocaleDateString()
              : 'Recently'
          }</div>
        </div>
      `
        )
        .join('');
    }

    // Set action button
    if (isAdmin) {
      actionBtn.textContent = 'Manage Club';
      actionBtn.onclick = () => {
        modal.style.display = 'none';
        switchSection('admin');
      };
    } else {
      actionBtn.textContent = 'View Events';
      actionBtn.onclick = () => {
        modal.style.display = 'none';
        switchSection('events');
      };
    }

    // Show modal
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Error opening club details:', error);
  }
}

/**
 * Handle member actions (promote/demote/remove)
 * @param {string} clubId - Club ID
 * @param {string} membershipId - Membership ID
 * @param {string} action - Action
 */
async function handleMemberAction(clubId, membershipId, action) {
  if (action === 'remove') {
    const res = await removeMember(membershipId);
    if (!res.success) {
      alert(res.error || 'Failed to remove member');
      return;
    }
  }

  if (action === 'make-admin') {
    const res = await updateMemberRole(membershipId, 'admin');
    if (!res.success) {
      alert(res.error || 'Failed to update member role');
      return;
    }
  }

  if (action === 'make-member') {
    const res = await updateMemberRole(membershipId, 'member');
    if (!res.success) {
      alert(res.error || 'Failed to update member role');
      return;
    }
  }

  await openClubDetails(clubId);

  if (document.getElementById('clubs-section').classList.contains('active')) {
    loadAllClubs();
  }
  if (document.getElementById('my-clubs-section').classList.contains('active')) {
    loadMyClubs();
  }
  if (document.getElementById('admin-section').classList.contains('active')) {
    loadAdminPanel();
  }
}

/**
 * Load admin panel
 */
async function loadAdminPanel() {
  try {
    // Load admin clubs
    const userClubsRes = await getUserClubs(currentUser.uid);
    if (userClubsRes.success) {
      userClubs = userClubsRes.data.filter((club) => club.userRole === 'admin');
    }

    const adminClubsList = document.getElementById('admin-clubs-list');
    const noticeClubSelect = document.getElementById('notice-club');
    const eventClubSelect = document.getElementById('event-club');

    // Clear and populate
    adminClubsList.innerHTML = '';
    noticeClubSelect.innerHTML = '';
    eventClubSelect.innerHTML = '';

    if (userClubs.length === 0) {
      adminClubsList.innerHTML =
        '<p class="empty-state">You are not an admin of any club</p>';
      return;
    }

    // Populate club cards for admin
    adminClubsList.innerHTML = userClubs
      .map(
        (club) => `
      <div class="club-card">
        <div class="club-header">
          <div class="club-icon">${club.icon || '🎯'}</div>
          <h3 class="club-name">${club.name}</h3>
        </div>
        <div class="club-body">
          <button class="btn btn-primary btn-manage-club" data-club-id="${club.id}">Manage Club</button>
        </div>
      </div>
    `
      )
      .join('');

    adminClubsList.querySelectorAll('.btn-manage-club').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const clubId = btn.getAttribute('data-club-id');
        await openClubDetails(clubId);
      });
    });

    // Populate selects
    userClubs.forEach((club) => {
      noticeClubSelect.innerHTML += `<option value="${club.id}">${club.name}</option>`;
      eventClubSelect.innerHTML += `<option value="${club.id}">${club.name}</option>`;
    });
  } catch (error) {
    console.error('Error loading admin panel:', error);
  }
}

/**
 * Handle joining a club
 * @param {string} clubId - Club ID
 * @param {HTMLElement} button - Button element
 */
async function handleJoinClub(clubId, button) {
  button.disabled = true;
  button.textContent = 'Joining...';

  try {
    const { joinClub } = await import('./db.js');
    const result = await joinClub(currentUser.uid, clubId);

    if (result.success) {
      button.textContent = '✓ Joined!';
      button.style.background = 'var(--success-color)';
      setTimeout(() => {
        loadAllClubs();
      }, 1500);
    } else {
      button.textContent = 'Error: ' + result.error;
      button.style.background = 'var(--danger-color)';
      button.disabled = false;
    }
  } catch (error) {
    console.error('Error joining club:', error);
    button.textContent = 'Error joining club';
    button.disabled = false;
  }
}

/**
 * Handle skip login (Demo mode)
 * @param {Event} e - Button click event
 */
async function handleSkipLogin(e) {
  e.preventDefault();
  clearError('login');

  showLoadingSpinner();

  try {
    const result = await demoLogin();

    if (result.success) {
      console.log('Demo login successful');
    } else {
      showError('login', result.error);
    }
  } catch (error) {
    console.error('Demo login error:', error);
    showError(
      'login',
      'Demo login failed. Please use regular login or contact admin.'
    );
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submission event
 */
async function handleLogin(e) {
  e.preventDefault();
  clearError('login');

  const formData = getFormData('login');
  const { email, password } = formData;

  // Validation
  if (!email || !isValidEmail(email)) {
    showError('login', 'Please enter a valid email address');
    return;
  }

  if (!password || !isValidPassword(password)) {
    showError('login', 'Password must be at least 6 characters');
    return;
  }

  showLoadingSpinner();

  try {
    const result = await loginUser(email, password);

    if (result.success) {
      resetForm('login');
    } else {
      let errorMessage = result.error;

      if (result.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (result.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (result.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (result.code === 'auth/too-many-requests') {
        errorMessage = 'Too many login attempts. Please try again later.';
      }

      showError('login', errorMessage);
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('login', 'An unexpected error occurred. Please try again.');
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Handle registration form submission
 * @param {Event} e - Form submission event
 */
async function handleRegister(e) {
  e.preventDefault();
  clearError('register');

  const formData = getFormData('register');
  const { fullName, email, password, confirmPassword } = formData;

  // Validation
  if (!fullName || fullName.length < 2) {
    showError('register', 'Please enter a valid full name');
    return;
  }

  if (!email || !isValidEmail(email)) {
    showError('register', 'Please enter a valid email address');
    return;
  }

  if (!password || !isValidPassword(password)) {
    showError('register', 'Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    showError('register', 'Passwords do not match');
    return;
  }

  showLoadingSpinner();

  try {
    const result = await registerUser(email, password, fullName);

    if (result.success) {
      const profileResult = await createStudentProfile(
        result.user.uid,
        result.user.email,
        result.user.displayName
      );

      if (!profileResult.success) {
        console.error('Profile creation failed:', profileResult.error);
      }

      resetForm('register');
      switchTab('login');
      showError('register', '✓ Registration successful! Please log in.');
    } else {
      let errorMessage = result.error;

      if (result.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (result.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (result.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }

      showError('register', errorMessage);
    }
  } catch (error) {
    console.error('Registration error:', error);
    showError('register', 'An unexpected error occurred. Please try again.');
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  if (!confirm('Are you sure you want to logout?')) {
    return;
  }

  showLoadingSpinner();

  try {
    const result = await logoutUser();
    if (result.success) {
      currentUser = null;
      console.log('Logged out successfully');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Handle authentication state changes
 * @param {Object|null} user - Current user or null
 */
function handleAuthStateChange(user) {
  if (user) {
    // User is logged in
    console.log('User authenticated:', user);
    currentUser = user;

    // Update sidebar with user info
    const avatar = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
    document.querySelector('.user-avatar').textContent = avatar;
    document.getElementById('sidebar-user-name').textContent =
      user.displayName || 'User';
    document.getElementById('sidebar-user-email').textContent = user.email;

    hideAuthContainer();
    showAppContainer();

    // Load dashboard by default
    switchSection('dashboard');
    loadDashboardData();
  } else {
    // User is logged out
    console.log('User logged out');
    currentUser = null;
    showAuthContainer();
    hideAppContainer();
  }
}

// Start the application
window.addEventListener('DOMContentLoaded', initializeApp);
