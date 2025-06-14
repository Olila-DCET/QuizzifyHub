const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const resultsContainer = document.getElementById('results-container');
const quizContainer = document.getElementById('quiz-container');
const studentCreateQuizBtn = document.getElementById('student-create-quiz-btn');
const studentQuizModal = document.getElementById('student-quiz-modal');
const closeStudentQuizModal = document.getElementById('close-student-quiz-modal');
const studentQuizForm = document.getElementById('student-quiz-form');
const studentQuizQuestionsDiv = document.getElementById('student-quiz-questions');
const cancelStudentQuizBtn = document.getElementById('cancel-student-quiz-btn');

let studentQuizData = null;
let studentQuestions = [];


if (studentCreateQuizBtn) {
  studentCreateQuizBtn.addEventListener('click', () => {
    studentQuizModal.style.display = 'flex';
    studentQuizForm.style.display = '';
    studentQuizQuestionsDiv.innerHTML = '';
    studentQuizForm.reset();
    studentQuizData = null;
    studentQuestions = [];
  });
}


if (closeStudentQuizModal) {
  closeStudentQuizModal.addEventListener('click', () => {
    studentQuizModal.style.display = 'none';
    studentQuizForm.style.display = '';
    studentQuizQuestionsDiv.innerHTML = '';
    studentQuizForm.reset();
    studentQuizData = null;
    studentQuestions = [];
  });
}
if (cancelStudentQuizBtn) {
  cancelStudentQuizBtn.addEventListener('click', () => {
    studentQuizModal.style.display = 'none';
    studentQuizForm.style.display = '';
    studentQuizQuestionsDiv.innerHTML = '';
    studentQuizForm.reset();
    studentQuizData = null;
    studentQuestions = [];
  });
}


const username = localStorage.getItem('username');
if (username && usernameDisplay) {
  usernameDisplay.textContent = `Hello, ${username}`;
}

function displayQuiz(quiz) {
  const normalizedSubject = quiz.subject.replace(/\s+/g, '').toLowerCase();
  let container = document.querySelector(`#category-${quiz.subject} .quiz-items`);
  if (!container) {
    container = document.querySelector(`#category-${normalizedSubject} .quiz-items`);
  }
  if (!container) return;

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

function displayNoQuizzes() {
  document.querySelectorAll('.quiz-items').forEach(container => {
    if (!container.children.length) {
      container.innerHTML = '<div class="no-quiz-msg" style="color:#888;">No quizzes in this category.</div>';
    }
  });
}

function displayQuizResults() {
  const username = localStorage.getItem('username');
  const results = (JSON.parse(localStorage.getItem('quizResults')) || [])
    .filter(r => r.username === username);

  if (!results.length) {
    resultsContainer.innerHTML = '<p>No quiz results yet.</p>';
    return;
  }

  results.sort((a, b) => b.date - a.date);

  resultsContainer.innerHTML = '';
  results.forEach((result, idx) => {
    resultsContainer.innerHTML += `
      <div class="result-card">
        <h4>${result.title}</h4>
        <p>Subject: ${result.subject} | Grade: ${result.grade}</p>
        <p>Score: ${result.score} / ${result.total}</p>
        <p>Date: ${new Date(result.date).toLocaleString()}</p>
        <p style="font-size:0.95em;color:#888;">Attempt #${results.length - idx}</p>
      </div>
    `;
  });
}

quizContainer.innerHTML = '';
const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
if (quizzes.length === 0) {
  quizContainer.innerHTML = '<p>No quizzes available.</p>';
} else {
  quizzes.forEach(displayQuiz);
  displayNoQuizzes();
}

document.addEventListener('DOMContentLoaded', displayQuizResults);

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('username');
    window.location.href = 'index.html';
  });
}

if (studentQuizForm) {
  studentQuizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = studentQuizForm.querySelector('#student-quiz-title').value.trim();
    const grade = studentQuizForm.querySelector('#student-quiz-grade').value.trim();
    const subject = studentQuizForm.querySelector('#student-quiz-subject').value.trim();
    const type = studentQuizForm.querySelector('input[name="student-answer-type"]:checked')?.value;

    if (!title || !grade || !subject || !type) {
      alert('Please fill in all fields.');
      return;
    }

    studentQuizData = {
      id: '_' + Math.random().toString(36).substr(2, 9),
      title,
      grade,
      subject,
      type,
      questions: []
    };
    studentQuestions = [];
    studentQuizForm.style.display = 'none';
    renderStudentQuestionForm();
  });
}

function renderStudentQuestionForm() {
  if (studentQuestions.length >= 10) {
    saveStudentQuiz();
    return;
  }

  studentQuizQuestionsDiv.innerHTML = `
    <form id="student-question-form">
      <input type="text" id="student-question-text" placeholder="Enter question" required />
      ${studentQuizData.type === 'multiple' ? `
        <input type="text" id="student-option1" placeholder="Option A" required />
        <input type="text" id="student-option2" placeholder="Option B" required />
        <input type="text" id="student-option3" placeholder="Option C" required />
        <input type="text" id="student-option4" placeholder="Option D" required />
        <input type="text" id="student-answer" placeholder="Correct Option (A, B, C, or D)" required />
      ` : `
        <input type="text" id="student-answer" placeholder="Correct Answer" required />
      `}
      <button type="submit">${studentQuestions.length === 9 ? 'Finish Quiz' : 'Add Question'}</button>
      <button type="button" id="cancel-question-btn" class="btn btn-secondary" style="margin-left:10px;">Cancel</button>
    </form>
    <p>${studentQuestions.length}/10 questions added</p>
  `;

  document.getElementById('cancel-question-btn').addEventListener('click', () => {
    studentQuizQuestionsDiv.innerHTML = '';
    studentQuizForm.style.display = '';
    studentQuizForm.reset();
    studentQuizData = null;
    studentQuestions = [];
  });

  document.getElementById('student-question-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const questionText = document.getElementById('student-question-text').value.trim();
    const answer = document.getElementById('student-answer').value.trim();

    if (!questionText || !answer) {
      alert('Please fill in all fields.');
      return;
    }

    let question = { questionText, answer };
    if (studentQuizData.type === 'multiple') {
      const option1 = document.getElementById('student-option1').value.trim();
      const option2 = document.getElementById('student-option2').value.trim();
      const option3 = document.getElementById('student-option3').value.trim();
      const option4 = document.getElementById('student-option4').value.trim();
      if (!option1 || !option2 || !option3 || !option4) {
        alert('Please fill in all options.');
        return;
      }
      question.options = [option1, option2, option3, option4];
      if (!['A', 'B', 'C', 'D'].includes(answer.toUpperCase())) {
        alert('Correct option must be A, B, C, or D.');
        return;
      }
    }
    studentQuestions.push(question);
    renderStudentQuestionForm();
  });
}

function saveStudentQuiz() {
  studentQuizData.questions = studentQuestions;
  const pending = JSON.parse(localStorage.getItem('pendingQuizzes') || '[]');
  pending.push(studentQuizData);
  localStorage.setItem('pendingQuizzes', JSON.stringify(pending));
  studentQuizQuestionsDiv.innerHTML = '<p style="color:green;font-weight:600;">Quiz submitted for admin approval!</p>';
  setTimeout(() => {
    studentQuizModal.style.display = 'none';
    studentQuizForm.style.display = '';
    studentQuizQuestionsDiv.innerHTML = '';
    studentQuizForm.reset();
    studentQuizData = null;
    studentQuestions = [];
  }, 1500);
}