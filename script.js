document.addEventListener("DOMContentLoaded", () => {
  // API endpoint to fetch questions
  const API_URL =
    "https://opentdb.com/api.php?amount=50&category=9&difficulty=easy&type=multiple";

  const startBtn = document.getElementById("start-btn");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");
  const questionContainer = document.getElementById("question-container");
  const questionText = document.getElementById("question-text");
  const choicesList = document.getElementById("choices-list");
  const resultContainer = document.getElementById("result-container");
  const scoreDisplay = document.getElementById("score");

  let questions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let answered = false; // Flag to prevent multiple selections

  startBtn.addEventListener("click", startQuiz);

  nextBtn.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showResult();
    }
  });

  restartBtn.addEventListener("click", () => {
    // Reset variables and fetch new questions on restart
    currentQuestionIndex = 0;
    score = 0;
    resultContainer.classList.add("hidden");
    startQuiz();
  });

  function startQuiz() {
    startBtn.classList.add("hidden");
    resultContainer.classList.add("hidden");
    questionContainer.classList.remove("hidden");

    // Fetch questions from the API
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        let results = data.results;
        // Randomly pick 5 questions from the results
        if (results.length > 5) {
          results = shuffleArray(results).slice(0, 5);
        }
        // Process each question: combine correct & incorrect answers, decode HTML, then shuffle choices
        questions = results.map((q) => {
          let choices = [...q.incorrect_answers];
          choices.push(q.correct_answer);
          choices = shuffleArray(choices);
          return {
            question: decodeHTML(q.question),
            choices: choices.map((choice) => decodeHTML(choice)),
            answer: decodeHTML(q.correct_answer),
          };
        });
        // Reset for new quiz
        currentQuestionIndex = 0;
        score = 0;
        showQuestion();
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
        questionText.textContent =
          "Failed to load questions. Please try again.";
      });
  }

  function showQuestion() {
    answered = false;
    nextBtn.classList.add("hidden");
    choicesList.innerHTML = "";
    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    currentQuestion.choices.forEach((choice) => {
      const li = document.createElement("li");
      li.textContent = choice;
      li.addEventListener("click", () => selectAnswer(li, choice));
      choicesList.appendChild(li);
    });
  }

  function selectAnswer(li, choice) {
    if (answered) return; // prevent multiple selections
    answered = true;
    const currentQuestion = questions[currentQuestionIndex];
    // Disable further clicking and highlight correct/incorrect answers
    Array.from(choicesList.children).forEach((child) => {
      child.style.pointerEvents = "none";
      if (child.textContent === currentQuestion.answer) {
        child.style.backgroundColor = "#4caf50"; // Green for correct
      } else {
        child.style.backgroundColor = "#f44336"; // Red for wrong
      }
    });
    if (choice === currentQuestion.answer) {
      score++;
    }
    nextBtn.classList.remove("hidden");
  }

  function showResult() {
    questionContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");
    scoreDisplay.textContent = `${score} out of ${questions.length}`;
  }

  // Utility: Fisher–Yates shuffle algorithm
  function shuffleArray(array) {
    let newArray = array.slice();
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Utility: Decode HTML entities returned by the API
  function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
});
