const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('id');
const quizDetails = document.getElementById('quiz-details');
const quizForm = document.getElementById('quiz-form');
const submitBtn = document.getElementById('submit-btn');
const resultDiv = document.getElementById('quiz-result');
const backBtn = document.getElementById('back-btn');
const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
const quiz = quizzes.find(q => q.id === quizId);
const username = localStorage.getItem('username') || 'guest';
const quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
const alreadyTaken = quizResults.some(
  r => r.quizId === quizId && r.username === username
);

if (backBtn) {
  backBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}

if (!quizId || !quiz || !quiz.questions || !quiz.questions.length) {
  quizDetails.innerHTML = '<p>⚠️ Quiz not found or has no questions. Please use a valid link.</p>';
  submitBtn.style.display = 'none';
} else if (alreadyTaken) {
  quizDetails.innerHTML = `
    <h2>${quiz.title}</h2>
    <p><strong>Grade:</strong> ${quiz.grade} | <strong>Subject:</strong> ${quiz.subject}</p>
    <p><strong>Type:</strong> ${quiz.type === 'multiple' ? 'Multiple Choice' : 'Short Answer'}</p>
    <div class="quiz-result" style="margin-top:1.5rem;color:var(--success);font-weight:600;">
      You have already taken this quiz.
    </div>
  `;
  submitBtn.style.display = 'none';
} else {
  quizDetails.innerHTML = `
    <h2>${quiz.title}</h2>
    <p><strong>Grade:</strong> ${quiz.grade} | <strong>Subject:</strong> ${quiz.subject}</p>
    <p><strong>Type:</strong> ${quiz.type === 'multiple' ? 'Multiple Choice' : 'Short Answer'}</p>
  `;

  quiz.questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'quiz-question';
    div.innerHTML = `<p><strong>Q${i + 1}:</strong> ${q.questionText}</p>`;

    if (quiz.type === 'multiple') {
      q.options.forEach((opt, j) => {
        const optionLetter = String.fromCharCode(65 + j); // 'A', 'B', 'C', ...
        div.innerHTML += `
          <label>
            <input type="radio" name="q${i}" value="${optionLetter}" required />
            ${optionLetter}: ${opt}
          </label><br/>
        `;
      });
    } else {
      div.innerHTML += `<input type="text" name="q${i}" required style="width: 100%; margin-top: 5px;" />`;
    }

    quizForm.appendChild(div);
  });
}

submitBtn.addEventListener('click', (e) => {
  e.preventDefault();

  if (!quiz || !quiz.questions) return;

  if (alreadyTaken) {
    resultDiv.innerHTML = `<div style="color:var(--warning);font-weight:600;">You have already taken this quiz.</div>`;
    return;
  }

  const formData = new FormData(quizForm);
  let score = 0;

  quiz.questions.forEach((q, i) => {
    const answer = (formData.get(`q${i}`) || '').trim();
    const correct = q.answer.trim();

    const isCorrect = quiz.type === 'multiple'
      ? answer.toUpperCase() === correct.toUpperCase()
      : answer.toLowerCase() === correct.toLowerCase();

    if (isCorrect) score++;
  });

  resultDiv.innerHTML = `<h3>Your Score: ${score} / ${quiz.questions.length}</h3>`;

  quiz.questions.forEach((q, i) => {
    const userAnswer = (formData.get(`q${i}`) || 'None').trim();
    const correctAnswer = q.answer;
    const isCorrect = quiz.type === 'multiple'
      ? userAnswer.toUpperCase() === correctAnswer.toUpperCase()
      : userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    resultDiv.innerHTML += `
      <p class="${isCorrect ? 'correct' : 'incorrect'}">
        <strong>Q${i + 1}:</strong> Your Answer: ${userAnswer} | Correct Answer: ${correctAnswer}
        ${isCorrect ? '✅' : '❌'}
      </p>
    `;
  });

  quizResults.push({
    quizId,
    username,
    title: quiz.title,
    subject: quiz.subject,
    grade: quiz.grade,
    score,
    total: quiz.questions.length,
    date: Date.now()
  });
  localStorage.setItem('quizResults', JSON.stringify(quizResults));

  submitBtn.disabled = true;
  submitBtn.textContent = "Quiz Taken";
});
