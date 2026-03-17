// Quiz Manager - QUIZ and Daily Challenge modals
window.QuizManager = {
    showQuizModal(app) {
        const questions = QuizManager.getQuizQuestions(app);
        if (questions.length === 0) {
            app.showMessage('Нет вопросов для квиза. Выберите предметы в разделе Предметы.');
            return;
        }
        QuizManager.quizState = { questions, currentIndex: 0, correctCount: 0, answered: false, app };
        const modal = document.getElementById('quiz-modal');
        if (modal) {
            modal.classList.add('show');
            QuizManager.renderQuizQuestion();
            document.getElementById('quiz-close-btn').onclick = () => QuizManager.closeQuizModal();
            document.getElementById('quiz-next-btn').onclick = () => QuizManager.quizNext();
            document.getElementById('quiz-finish-btn').onclick = () => QuizManager.closeQuizModal();
        }
    },
    getQuizQuestions(app) {
        let questions = (typeof DataManager !== 'undefined' && DataManager.getQuizQuestions) ? DataManager.getQuizQuestions() : [];
        if (app.selectedGrade && app.favoriteSubjects?.length > 0 && window.subjectManager) {
            const extra = [];
            app.favoriteSubjects.forEach(subjectId => {
                const topics = window.subjectManager.getTopicsForSubject(subjectId, app.selectedGrade) || [];
                topics.forEach(t => {
                    if (t.quiz?.questions?.length) {
                        t.quiz.questions.forEach(q => extra.push({ ...q, explanation: q.explanation || '' }));
                    }
                });
            });
            if (extra.length > 0) {
                questions = [...questions, ...extra].sort(() => Math.random() - 0.5).slice(0, 10);
            }
        }
        return questions.length ? questions : ((typeof DataManager !== 'undefined' && DataManager.getQuizQuestions) ? DataManager.getQuizQuestions() : []);
    },
    renderQuizQuestion() {
        const { questions, currentIndex, correctCount } = QuizManager.quizState;
        const question = questions[currentIndex];
        if (!question) return;
        const card = document.getElementById('quiz-card');
        const result = document.getElementById('quiz-result');
        const feedback = document.getElementById('quiz-feedback');
        if (card) card.classList.remove('hidden');
        if (result) result.classList.add('hidden');
        if (feedback) feedback.classList.add('hidden');
        const qEl = document.getElementById('quiz-question');
        if (qEl) qEl.textContent = question.question;
        const counterEl = document.getElementById('quiz-counter');
        if (counterEl) counterEl.textContent = (currentIndex + 1) + ' / ' + questions.length;
        const scoreEl = document.getElementById('quiz-score');
        if (scoreEl) scoreEl.textContent = correctCount + ' правильных';
        const optionsEl = document.getElementById('quiz-options');
        if (optionsEl) {
            optionsEl.innerHTML = '';
            optionsEl.classList.remove('hidden');
            (question.options || []).forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.textContent = opt;
                btn.onclick = () => QuizManager.quizSelectAnswer(i);
                optionsEl.appendChild(btn);
            });
        }
    },
    quizSelectAnswer(selectedIndex) {
        if (QuizManager.quizState.answered) return;
        QuizManager.quizState.answered = true;
        const { questions, currentIndex } = QuizManager.quizState;
        const question = questions[currentIndex];
        const correct = question.correct === selectedIndex;
        if (correct) QuizManager.quizState.correctCount++;
        document.querySelectorAll('.quiz-option-btn').forEach((btn, i) => {
            btn.disabled = true;
            if (i === question.correct) btn.classList.add('correct');
            else if (i === selectedIndex && !correct) btn.classList.add('incorrect');
        });
        const feedbackText = document.getElementById('quiz-feedback-text');
        if (feedbackText) feedbackText.textContent = correct ? 'Верно! ' + (question.explanation || '') : 'Неверно. ' + (question.explanation || 'Правильный ответ: ' + (question.options[question.correct] || ''));
        const feedback = document.getElementById('quiz-feedback');
        if (feedback) feedback.classList.remove('hidden');
        const scoreEl = document.getElementById('quiz-score');
        if (scoreEl) scoreEl.textContent = QuizManager.quizState.correctCount + ' правильных';
    },
    quizNext() {
        QuizManager.quizState.currentIndex++;
        QuizManager.quizState.answered = false;
        if (QuizManager.quizState.currentIndex >= QuizManager.quizState.questions.length) {
            QuizManager.showQuizResult();
        } else {
            QuizManager.renderQuizQuestion();
        }
    },
    showQuizResult() {
        const card = document.getElementById('quiz-card');
        const result = document.getElementById('quiz-result');
        if (card) card.classList.add('hidden');
        if (result) {
            result.classList.remove('hidden');
            const { correctCount, questions } = QuizManager.quizState;
            const pct = Math.round((correctCount / questions.length) * 100);
            const textEl = document.getElementById('quiz-result-text');
            if (textEl) textEl.textContent = 'Вы ответили правильно на ' + correctCount + ' из ' + questions.length + ' вопросов (' + pct + '%)';
        }
    },
    closeQuizModal() {
        const modal = document.getElementById('quiz-modal');
        if (modal) modal.classList.remove('show');
    },
    showDailyChallengeModal() {
        const challenge = { question: 'Найдите значение: 2³ × (4 + 6) ÷ 2', options: ['20', '32', '40', '56'], correct: 2, explanation: '2³ = 8, 4+6 = 10, 8×10 = 80, 80÷2 = 40' };
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'daily-challenge-modal';
        modal.innerHTML = '<div class="modal-content quiz-modal-content"><div class="quiz-header"><h2 style="margin:0">Задача дня</h2><button class="quiz-close-btn" id="daily-close-btn"><i class="material-icons">close</i></button></div><div class="quiz-question">' + challenge.question + '</div><div class="quiz-options" id="daily-options"></div><div class="quiz-feedback hidden" id="daily-feedback"><p id="daily-feedback-text"></p><button class="btn btn-primary" id="daily-done-btn">Готово</button></div></div>';
        document.body.appendChild(modal);
        const optionsEl = modal.querySelector('#daily-options');
        challenge.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.textContent = opt;
            btn.onclick = () => {
                if (modal.dataset.answered) return;
                modal.dataset.answered = '1';
                optionsEl.querySelectorAll('button').forEach((b, j) => {
                    b.disabled = true;
                    if (j === challenge.correct) b.classList.add('correct');
                    else if (j === i && i !== challenge.correct) b.classList.add('incorrect');
                });
                modal.querySelector('#daily-feedback-text').textContent = (i === challenge.correct) ? 'Верно! +50 баллов. ' + challenge.explanation : 'Неверно. ' + challenge.explanation;
                modal.querySelector('#daily-feedback').classList.remove('hidden');
            };
            optionsEl.appendChild(btn);
        });
        modal.querySelector('#daily-close-btn').onclick = () => modal.remove();
        modal.querySelector('#daily-done-btn').onclick = () => modal.remove();
    }
};
