const logoutBtn = document.getElementById('logout-btn');
const quizForm = document.getElementById('create-quiz-form');
const quizList = document.getElementById('quiz-list');
const questionFormSection = document.createElement('section');
questionFormSection.className = 'admin-section';
document.querySelector('.admin-main').appendChild(questionFormSection);

let currentQuiz = null;
let currentQuestions = [];

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('username');
  window.location.href = 'index.html';
});

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

quizForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = capitalize(document.getElementById('quiz-title').value.trim());
  const grade = capitalize(document.getElementById('quiz-grade').value.trim());
  const subject = capitalize(document.getElementById('quiz-subject').value.trim());
  const type = document.querySelector('input[name="answer-type"]:checked')?.value;

  if (!title || !grade || !subject || !type) return alert('Please fill in all fields.');

  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  const isDuplicate = quizzes.some(q => q.title === title && q.grade === grade && q.subject === subject);
  if (isDuplicate) return alert('This quiz already exists.');

  currentQuiz = { 
    id: generateId(), 
    title, 
    grade, 
    subject, 
    type, 
    questions: [] 
  };
  currentQuestions = [];

  renderQuestionForm();
  quizForm.reset();
});

function renderQuestionForm() {
  questionFormSection.innerHTML = `
    <h2>Add Questions (${currentQuestions.length + 1} to 10)</h2>
    <form id="question-form">
      <input type="text" id="question-text" placeholder="Enter question" required />
      ${currentQuiz.type === 'multiple' ? `
        <input type="text" id="option1" placeholder="Option A" required />
        <input type="text" id="option2" placeholder="Option B" required />
        <input type="text" id="option3" placeholder="Option C" required />
        <input type="text" id="option4" placeholder="Option D" required />
        <input type="text" id="answer" placeholder="Correct Option (A, B, C, or D)" required />
      ` : `
        <input type="text" id="answer" placeholder="Correct Answer" required />
      `}
      <button type="submit">${currentQuestions.length === 9 ? 'Finish Quiz' : 'Add Question'}</button>
    </form>
    <p>${currentQuestions.length}/10 questions added</p>
  `;

  document.getElementById('question-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const questionText = document.getElementById('question-text').value.trim();
    const answer = document.getElementById('answer').value.trim();

    if (!questionText || !answer) return alert('Please fill in all required fields.');

    let question = { questionText, answer };

    if (currentQuiz.type === 'multiple') {
      const options = [
        document.getElementById('option1').value.trim(),
        document.getElementById('option2').value.trim(),
        document.getElementById('option3').value.trim(),
        document.getElementById('option4').value.trim()
      ];

      if (options.some(opt => !opt)) return alert('Please fill in all options.');
      if (!['A', 'B', 'C', 'D'].includes(answer.toUpperCase())) {
        return alert('Correct option must be A, B, C, or D.');
      }

      question.options = options;
      question.answer = answer.toUpperCase();
    }

    currentQuestions.push(question);

    if (currentQuestions.length === 10) {
      saveQuiz();
    } else {
      renderQuestionForm();
    }
  });
}

function saveQuiz() {
  currentQuiz.questions = currentQuestions;

  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  quizzes.push(currentQuiz);
  localStorage.setItem('quizzes', JSON.stringify(quizzes));

  console.log("Saved quiz:", currentQuiz);

  currentQuiz = null;
  currentQuestions = [];
  questionFormSection.innerHTML = '';
  displayQuizzes();
  alert('Quiz created successfully!');
}

function displayQuizzes() {
  quizList.innerHTML = '';
  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');

  if (quizzes.length === 0) {
    quizList.innerHTML = '<p>No quizzes created yet.</p>';
    return;
  }

  quizzes.forEach((quiz, index) => {
    const div = document.createElement('div');
    div.className = 'quiz-card';
div.innerHTML = `
  <h3>${quiz.title}</h3>
  <p>Grade: ${quiz.grade} | Subject: ${quiz.subject} | Type: ${quiz.type === 'multiple' ? 'Multiple Choice' : 'Short Answer'}</p>
  <p>${quiz.questions.length} questions</p>
  <a href="take-quiz.html?id=${quiz.id}" target="_blank" class="btn">Take Quiz</a>
  <button class="btn" onclick="deleteQuiz(${index})">Delete</button>
`;
    quizList.appendChild(div);
  });
}

function deleteQuiz(index) {
  if (!confirm('Are you sure you want to delete this quiz?')) return;
  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  quizzes.splice(index, 1);
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
  displayQuizzes();
}
function displayPendingQuizzes() {
  let pendingList = document.getElementById('pending-quiz-list');
  if (!pendingList) {
    pendingList = document.createElement('div');
    pendingList.id = 'pending-quiz-list';
    pendingList.innerHTML = '<h2>Pending Student Quizzes</h2>';
    document.querySelector('.admin-main').prepend(pendingList);
  }
  const pending = JSON.parse(localStorage.getItem('pendingQuizzes') || '[]');
  pendingList.innerHTML = '<h2>Pending Student Quizzes</h2>';
  if (pending.length === 0) {
    pendingList.innerHTML += '<p>No pending quizzes.</p>';
    return;
  }
  pending.forEach((quiz, idx) => {
    const div = document.createElement('div');
    div.className = 'quiz-card';
    div.innerHTML = `
      <h3>${quiz.title}</h3>
      <p>Grade: ${quiz.grade} | Subject: ${quiz.subject} | Type: ${quiz.type === 'multiple' ? 'Multiple Choice' : 'Short Answer'}</p>
      <p>${quiz.questions.length} questions</p>
      <button onclick="approveQuiz(${idx})">Approve</button>
      <button onclick="rejectQuiz(${idx})">Reject</button>
    `;
    pendingList.appendChild(div);
  });
}

window.approveQuiz = function(idx) {
  const pending = JSON.parse(localStorage.getItem('pendingQuizzes') || '[]');
  const quiz = pending.splice(idx, 1)[0];
  
  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  quizzes.push(quiz);
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
  localStorage.setItem('pendingQuizzes', JSON.stringify(pending));
  displayPendingQuizzes();
  displayQuizzes();
};

window.rejectQuiz = function(idx) {
  const pending = JSON.parse(localStorage.getItem('pendingQuizzes') || '[]');
  pending.splice(idx, 1);
  localStorage.setItem('pendingQuizzes', JSON.stringify(pending));
  displayPendingQuizzes();
};

document.addEventListener('DOMContentLoaded', () => {
  displayQuizzes();
  displayPendingQuizzes();
});


