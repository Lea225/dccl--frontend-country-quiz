document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://restcountries.com/v3.1/all';
    const steps = document.querySelectorAll('.steps a');
    const questionElement = document.querySelector('.question');
    const answersElement = document.querySelector('.possible-anwers');
    const congratsDiv = document.querySelector('.congrats-div');
    const congratsScore = congratsDiv.querySelector('span');
    const playAgainButton = congratsDiv.querySelector('button');
    let countries = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let questions = []; // Tableau pour stocker les questions et réponses

    // Fetch countries data
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            countries = data;
            generateQuestions(); // Générer toutes les questions à l'avance
            displayQuestion(currentQuestionIndex); // Afficher la première question
        })
        .catch(error => console.error('Error fetching countries:', error));

    function generateQuestions() {
        questions = []; // Réinitialiser les questions
        for (let i = 0; i < 10; i++) {
            const questionType = Math.random() < 0.5 ? 'capital' : 'flag'; // 50% de chance pour chaque type
            const country = countries[Math.floor(Math.random() * countries.length)];
            if (questionType === 'capital') {
                const correctAnswer = country.capital ? country.capital[0] : 'N/A';
                const wrongAnswers = generateWrongAnswers(correctAnswer);
                const answers = shuffle([correctAnswer, ...wrongAnswers]);
                questions.push({
                    questionText: `What is the capital of ${country.name.common}?`,
                    correctAnswer,
                    answers
                });
            } else {
                const correctAnswer = country.name.common;
                const wrongAnswers = generateWrongAnswers(correctAnswer, true);
                const answers = shuffle([correctAnswer, ...wrongAnswers]);
                questions.push({
                    questionText: `Which country does this flag belong to?`,
                    correctAnswer,
                    answers,
                    flag: country.flags.png
                });
            }
        }
    }

    function displayQuestion(index) {
        const question = questions[index];
        questionElement.textContent = question.questionText;
        answersElement.innerHTML = '';

        if (question.flag) {
            const flagImg = document.createElement('img');
            flagImg.src = question.flag;
            flagImg.alt = 'Flag';
            flagImg.classList.add('flag-img');
            questionElement.appendChild(flagImg);
        }

        question.answers.forEach(answer => {
            const p = document.createElement('p');
            p.innerHTML = `<span class="answer-text">${answer}</span><span class="icon"></span>`;
            p.addEventListener('click', () => checkAnswer(p, answer, question.correctAnswer));
            answersElement.appendChild(p);
        });

        updateActiveStep();
    }

    function generateWrongAnswers(correctAnswer, isFlag = false) {
        const wrongAnswers = [];
        while (wrongAnswers.length < 3) {
            const wrongCountry = countries[Math.floor(Math.random() * countries.length)];
            const wrongAnswer = isFlag ? wrongCountry.name.common : (wrongCountry.capital ? wrongCountry.capital[0] : 'N/A');
            if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        return wrongAnswers;
    }

    function checkAnswer(p, selectedAnswer, correctAnswer) {
        const icon = p.querySelector('.icon');
        if (selectedAnswer === correctAnswer) {
            icon.classList.add('check');
            score++;
        } else {
            icon.classList.add('close');
            p.classList.add('incorrect'); // Ajout de la classe incorrect
    
            // Marquer la bonne réponse avec l'icône "check"
            const allAnswers = answersElement.querySelectorAll('p');
            allAnswers.forEach(answer => {
                if (answer.textContent.includes(correctAnswer)) {
                    answer.querySelector('.icon').classList.add('check');
                }
            });
        }
    
        // Désactiver les autres options après la sélection
        const allAnswers = answersElement.querySelectorAll('p');
        allAnswers.forEach(answer => answer.style.pointerEvents = 'none');
    
        // Passer à la question suivante après un délai
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < 10) {
                displayQuestion(currentQuestionIndex);
            } else {
                displayCongrats();
            }
        }, 1000);
    }    

    // Fonction pour mettre à jour la classe active sur le numéro de question actuel
    function updateActiveStep() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentQuestionIndex);
        });
    }

    function displayCongrats() {
        congratsScore.textContent = `${score}/10`; // Afficher le score sur 10
        congratsDiv.style.display = 'block';
        document.querySelector('.container').style.display = 'none'; // Cacher le container
    }

    function shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    playAgainButton.addEventListener('click', () => {
        score = 0;
        currentQuestionIndex = 0;
        congratsDiv.style.display = 'none';
        document.querySelector('.container').style.display = 'block'; // Afficher le container
        generateQuestions(); // Régénérer les questions
        displayQuestion(currentQuestionIndex);
    });

    // Ajout des événements de clic pour les steps
    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            currentQuestionIndex = index;
            displayQuestion(currentQuestionIndex);
        });
    });
});