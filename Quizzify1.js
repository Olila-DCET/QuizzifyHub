const modal = document.getElementById('login-modal');
const loginBtn = document.querySelector('.btn-login');
const signupBtn = document.querySelector('.btn-signup');
const form = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-submit-btn');
const authToggleText = document.getElementById('auth-toggle-text');
const authMessage = document.getElementById('auth-message');
const closeBtn = document.getElementById('close-modal');
const startBtn = document.getElementById('start-learning-btn');
const createQuizBtn = document.querySelector('.create-btn');
const featuresLink = document.querySelector('.nav-link[href="#features"]');
const featuresModal = document.getElementById('features-modal');
const closeFeaturesModal = document.getElementById('close-features-modal');


if (featuresLink && featuresModal && closeFeaturesModal) {
  featuresLink.addEventListener('click', (e) => {
    e.preventDefault();
    featuresModal.classList.add('active');
  });
  closeFeaturesModal.addEventListener('click', () => {
    featuresModal.classList.remove('active');
  });
  window.addEventListener('click', (e) => {
    if (e.target === featuresModal) featuresModal.classList.remove('active');
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && featuresModal.classList.contains('active')) featuresModal.classList.remove('active');
  });
}


let isSignup = false;
let isAdminLogin = false;


document.addEventListener('click', (e) => {
  if (e.target.id === 'toggle-auth') {
    e.preventDefault();
    isSignup = !isSignup;
    isAdminLogin = false;
    renderAuthMode();
  }
});


document.addEventListener('click', (e) => {
  if (e.target.id === 'admin-login-toggle') {
    e.preventDefault();
    isAdminLogin = true;
    isSignup = false;
    renderAuthMode();
    modal.classList.add('active');
  }
});


[startBtn, loginBtn, signupBtn, createQuizBtn].forEach((btn) => {
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      isSignup = btn === signupBtn || btn === createQuizBtn;
      isAdminLogin = false;
      renderAuthMode();
      modal.classList.add('active');
    });
  }
});


function closeModal() {
  modal.classList.remove('active');
  form.reset();
  removeConfirmPasswordField();
  authMessage.textContent = '';
  isAdminLogin = false;
}

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});


function renderAuthMode() {
  authTitle.textContent = isAdminLogin ? 'Admin Login' : (isSignup ? 'Sign Up' : 'Login');
  authBtn.textContent = isAdminLogin ? 'Login as Admin' : (isSignup ? 'Sign Up' : 'Login');
  authToggleText.innerHTML = isSignup
    ? `Already have an account? <a href="#" id="toggle-auth">Log in here</a>.`
    : `Don't have an account? <a href="#" id="toggle-auth">Sign up here</a>.`;

  if (!isSignup) {
    removeConfirmPasswordField();
  } else if (!document.getElementById('confirm-password')) {
    const label = document.createElement('label');
    label.setAttribute('for', 'confirm-password');
    label.textContent = 'Confirm Password:';

    const confirmInput = document.createElement('input');
    confirmInput.type = 'password';
    confirmInput.id = 'confirm-password';
    confirmInput.placeholder = 'Confirm your password';
    confirmInput.required = true;

    authBtn.before(confirmInput);
    confirmInput.before(label);
  }

  authMessage.textContent = '';
}


function removeConfirmPasswordField() {
  document.getElementById('confirm-password')?.remove();
  document.querySelector('label[for="confirm-password"]')?.remove();
}


form.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirm-password')?.value.trim();

  if (!username || !password || (isSignup && !confirmPassword)) {
    authMessage.style.color = 'red';
    authMessage.textContent = 'Please fill in all fields.';
    return;
  }

  if (isSignup && password !== confirmPassword) {
    authMessage.style.color = 'red';
    authMessage.textContent = 'Passwords do not match.';
    return;
  }

  if (isSignup) {
    if (localStorage.getItem(`user_${username}`)) {
      authMessage.style.color = 'red';
      authMessage.textContent = 'Username already taken.';
      return;
    }
    localStorage.setItem(`user_${username}`, JSON.stringify({ username, password }));
    authMessage.style.color = 'green';
    authMessage.textContent = 'Signup successful! You can now log in.';
    isSignup = false;
    setTimeout(() => {
      renderAuthMode();
    }, 1000);
  } else if (isAdminLogin) {
    if (username === 'admin' && password === 'admin123') {
      authMessage.style.color = 'green';
      authMessage.textContent = 'Admin login successful! Redirecting...';
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 1000);
    } else {
      authMessage.style.color = 'red';
      authMessage.textContent = 'Invalid admin credentials.';
    }
  } else {
    const user = JSON.parse(localStorage.getItem(`user_${username}`));
    if (user && user.password === password) {
      authMessage.style.color = 'green';
      authMessage.textContent = 'Login successful! Redirecting...';
      localStorage.setItem('username', username);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      authMessage.style.color = 'red';
      authMessage.textContent = 'Invalid credentials.';
    }
  }
});
