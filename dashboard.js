// Elements
const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const resultsContainer = document.getElementById('results-container');
const quizContainer = document.getElementById('quiz-container');

// Username display
const username = localStorage.getItem('username');
if (username && usernameDisplay) {
  usernameDisplay.textContent = `Hello, ${username}`;
}

// Display a quiz card
function displayQuiz(quiz) {
  // Normalize subject for category id (remove spaces, lowercase)
  const normalizedSubject = quiz.subject.replace(/\s+/g, '').toLowerCase();
  let container = document.querySelector(`#category-${normalizedSubject} .quiz-items`);

  // If subject category doesn't exist, create it dynamically
  if (!container) {
    const newCategory = document.createElement('div');
    newCategory.className = 'quiz-category';
    newCategory.id = `category-${normalizedSubject}`;
    newCategory.innerHTML = `
      <h4>${quiz.subject}</h4>
      <div class="quiz-items"></div>
    `;
    quizContainer.appendChild(newCategory);
    container = newCategory.querySelector('.quiz-items');
  }

  
  if (!quiz.questions || !quiz.questions.length) return;

  const quizDiv = document.createElement('div');
  quizDiv.className = 'quiz-card';
  quizDiv.innerHTML = `
    <strong>${quiz.title}</strong><br/>
    <span class="quiz-grade">Grade Level: ${quiz.grade}</span><br/>
    <button class="btn-take-quiz" onclick="window.location.href='take-quiz.html?id=${quiz.id}'">Take Quiz</button>
  `;
  container.appendChild(quizDiv);

  const msg = container.querySelector('.no-quiz-msg');
  if (msg) msg.remove();
}

// Display "No quizzes" message if needed
function displayNoQuizzes() {
  document.querySelectorAll('.quiz-items').forEach(container => {
    if (!container.children.length) {
      const msg = document.createElement('p');
      msg.className = 'no-quiz-msg';
      msg.textContent = 'No quizzes available.';
      container.appendChild(msg);
    }
  });
}

// Display quiz results
function displayQuizResults() {
  const results = JSON.parse(localStorage.getItem('quizResults')) || [];

  if (!results.length) {
    resultsContainer.innerHTML = '<p>No quiz results yet.</p>';
    return;
  }

  resultsContainer.innerHTML = '';
  results.forEach((result) => {
    const div = document.createElement('div');
    div.className = 'result-card';
    div.innerHTML = `
      <h4>${result.title}</h4>
      <p><strong>Score:</strong> ${result.score} / ${result.total}</p>
      <p><strong>Subject:</strong> ${result.subject} | <strong>Grade:</strong> ${result.grade}</p>
      <p><strong>Date:</strong> ${new Date(result.date).toLocaleString()}</p>
    `;
    resultsContainer.appendChild(div);
  });
}

// Load quizzes
quizContainer.innerHTML = ''; // Clear previous

const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
if (quizzes.length === 0) {
  quizContainer.innerHTML = '<p>No quizzes available.</p>';
} else {
  quizzes.forEach(displayQuiz);
  displayNoQuizzes();
}

// Load results
document.addEventListener('DOMContentLoaded', displayQuizResults);

// Logout logic
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('username');
      window.location.href = 'Quizzify1.html';
    }
  });
}
