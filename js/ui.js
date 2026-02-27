/**
 * UI Module
 * Handles DOM manipulation and UI updates
 */

/**
 * Show loading spinner
 */
export function showLoadingSpinner() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.style.display = 'flex';
  }
}

/**
 * Hide loading spinner
 */
export function hideLoadingSpinner() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.style.display = 'none';
  }
}

/**
 * Switch between tabs (Login/Register)
 * @param {string} tabName - Tab name ('login' or 'register')
 */
export function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.remove('active');
  });

  // Remove active class from all buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  // Show selected tab
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Add active class to clicked button
  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

/**
 * Show error message in a form
 * @param {string} formName - Form identifier ('login' or 'register')
 * @param {string} message - Error message
 */
export function showError(formName, message) {
  const errorElement = document.getElementById(`${formName}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

/**
 * Clear error message
 * @param {string} formName - Form identifier ('login' or 'register')
 */
export function clearError(formName) {
  const errorElement = document.getElementById(`${formName}-error`);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password (minimum 6 characters)
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid password
 */
export function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Reset form fields
 * @param {string} formName - Form identifier ('login' or 'register')
 */
export function resetForm(formName) {
  const form = document.getElementById(`${formName}-form`);
  if (form) {
    form.reset();
  }
  clearError(formName);
}

/**
 * Hide authentication container
 */
export function hideAuthContainer() {
  const authContainer = document.getElementById('auth-container');
  if (authContainer) {
    authContainer.style.display = 'none';
  }
}

/**
 * Show authentication container
 */
export function showAuthContainer() {
  const authContainer = document.getElementById('auth-container');
  if (authContainer) {
    authContainer.style.display = 'flex';
  }
}

/**
 * Show app container
 */
export function showAppContainer() {
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.style.display = 'grid';
  }
}

/**
 * Hide app container
 */
export function hideAppContainer() {
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.style.display = 'none';
  }
}

/**
 * Disable button
 * @param {string} buttonId - Button element ID
 */
export function disableButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = true;
    button.style.opacity = '0.6';
  }
}

/**
 * Enable button
 * @param {string} buttonId - Button element ID
 */
export function enableButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = false;
    button.style.opacity = '1';
  }
}

/**
 * Get form input values
 * @param {string} formName - Form identifier ('login' or 'register')
 * @returns {Object} Form data object
 */
export function getFormData(formName) {
  const form = document.getElementById(`${formName}-form`);
  if (!form) return {};

  const formData = new FormData(form);
  const data = {};

  for (let [key, value] of formData.entries()) {
    data[key] = value.trim();
  }

  return data;
}

/**
 * Update page title
 * @param {string} title - New title
 */
export function updatePageTitle(title) {
  document.title = title;
}
