const quizDiv = document.getElementById("quiz");
const timerDiv = document.getElementById("timer");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const reportCard = document.getElementById("reportCard");
const analysisCard = document.getElementById("analysisCard");
const viewAnalysisBtn = document.getElementById("viewAnalysisBtn");
const initialStartScreen = document.getElementById("initialStartScreen");
const centerStartBtn = document.getElementById("centerStartBtn");
const quizBox = document.getElementById("quizBox");
const questionCountDisplay = document.getElementById('questionCountDisplay');
const progressBar = document.getElementById('progressBar'); 

let selectedAnswers = [], quizLocked = [], correctCount = 0;
let timer = 1500; // 25 minutes
let timerInterval; 

const questions = [];

// DOM लोड होने के बाद डेटा कलेक्ट करें
document.querySelectorAll(".question-data").forEach(qEl => {
  const q = qEl.querySelector(".q").innerText;
  const opts = Array.from(qEl.querySelectorAll(".opt")).map(el => el.innerText);
  const ans = parseInt(qEl.getAttribute("data-answer"));
  const explanation = qEl.getAttribute("data-explanation") || "";
  questions.push({ question: q, options: opts, answer : ans, explanation: explanation });
});

function renderAllQuestions() {
  let html = "";
  let attemptedCount = 0;
  
  questions.forEach((q, index) => {
    if (selectedAnswers[index] !== undefined) attemptedCount++;

    html += `<div class="question-card">
      <div class="question-number-circle">${index + 1}</div>
      <div class="question">${q.question}</div>
      <div class="options">`;
    q.options.forEach((opt, i) => {
      const isSelected = selectedAnswers[index] === i ? " selected" : "";
      const onClickAttr = quizLocked[index] ? '' : `onclick='selectAnswer(${index}, ${i})'`;
      html += `<div class='option${isSelected}' ${onClickAttr}>${opt}</div>`;
    });
    html += `</div></div>`;
  });
  quizDiv.innerHTML = html;

  if (questionCountDisplay) {
      questionCountDisplay.textContent = `Questions : ${attemptedCount}/${questions.length}`;
  }
  if (progressBar) {
      const progressPercent = (attemptedCount / questions.length) * 100;
      progressBar.style.width = `${progressPercent}%`;
  }
}

window.selectAnswer = function(qIndex, aIndex) {
  if (quizLocked[qIndex]) return;
  selectedAnswers[qIndex] = aIndex;
  renderAllQuestions(); 
};

function updateTimer() {
  let min = Math.floor(timer / 60);
  let sec = timer % 60;
  timerDiv.textContent = `🕛 ${min}:${sec < 10 ? '0' + sec : sec}`;
  if (timer <= 0) {
    clearInterval(timerInterval);
    submitResults();
  }
  timer--;
}

function submitResults() {
  clearInterval(timerInterval);
  quizLocked = questions.map(() => true);
  renderAllQuestions(); 

  submitBtn.style.display = 'none';
  resetBtn.style.display = 'none';
  reportCard.style.display = 'block';
  
  let attempted = selectedAnswers.filter(v => v !== undefined).length;
  correctCount = selectedAnswers.filter((v, i) => v === questions[i].answer).length;

  document.getElementById("total").textContent = questions.length;
  document.getElementById("attempted").textContent = attempted;
  document.getElementById("correct").textContent = correctCount;
  document.getElementById("wrong").textContent = attempted - correctCount;
  document.getElementById("score").textContent = correctCount;
  document.getElementById("totalScore").textContent = questions.length;

  const percent = ((correctCount / questions.length) * 100).toFixed(2);
  const msg = percent >= 80 ? "Excellent Work!" : percent >= 50 ? "Good Job!" : "Keep Practicing!";
  document.getElementById("resultMessage").textContent = msg;
  
  reportCard.scrollIntoView({ behavior: "smooth" });
}

function showAnalysis() {
  analysisCard.style.display = 'block';
  const container = document.getElementById("analysisContent");
  container.innerHTML = "";

  questions.forEach((q, i) => {
    const userAnswer = selectedAnswers[i];
    let feedback = "Not Attempted", feedbackClass = "not-attempted-feedback";

    if (userAnswer !== undefined) {
      const isCorrect = userAnswer === q.answer;
      feedback = isCorrect ? "Correct" : "Wrong";
      feedbackClass = isCorrect ? "correct-feedback" : "wrong-feedback";
    }

    let html = `<div class='analysis-box'>
      <div class="question-number-circle">${i + 1}</div>
      <div class="question">${q.question}</div>`;
    
    q.options.forEach((opt, j) => {
      let cls = "option";
      if (j === q.answer) cls += " correct";
      if (j === userAnswer && j !== q.answer) cls += " wrong"; 
      html += `<div class='${cls}'>${opt}</div>`;
    });
    
    html += `<div class='feedback ${feedbackClass}'>${feedback}</div>`;
    if (q.explanation) {
      html += `<div class='explanation-box'><b>📝 स्पष्टीकरण :</b> ${q.explanation}</div>`;
    }
    html += `</div>`;
    container.innerHTML += html;
  });
  analysisCard.scrollIntoView({ behavior: "smooth" });
}

centerStartBtn.onclick = () => {
    initialStartScreen.style.display = 'none';
    quizBox.style.display = 'block';
    timerInterval = setInterval(updateTimer, 1000);
    renderAllQuestions();
};

submitBtn.onclick = submitResults;
resetBtn.onclick = () => location.reload(); 
viewAnalysisBtn.onclick = showAnalysis;

document.addEventListener("DOMContentLoaded", () => {
    questionCountDisplay.textContent = `Questions : 0/${questions.length}`;
});
