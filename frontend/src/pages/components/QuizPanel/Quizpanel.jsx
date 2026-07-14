import { useState } from 'react';
import './Quizpanel.css';
import { QUIZ_QUESTIONS } from '../Mockdata';

export default function QuizPanel({ doc }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const docTitle = doc?.name || 'Current document';
  const q = QUIZ_QUESTIONS[current];
  const progress = (current / QUIZ_QUESTIONS.length) * 100;

  const choose = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (current + 1 >= QUIZ_QUESTIONS.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  if (done) return (
    <div className="panel quiz-panel">
      <div className="quiz-result">
        <div className="quiz-result__emoji">{score === QUIZ_QUESTIONS.length ? '🏆' : '🎯'}</div>
        <div className="quiz-result__score">{score}/{QUIZ_QUESTIONS.length} Correct</div>
        <p className="quiz-result__msg">
          {score === QUIZ_QUESTIONS.length
            ? 'Perfect score! You mastered this document.'
            : 'Good attempt! Review the summary to strengthen your understanding.'}
        </p>
        <button className="btn-accent" onClick={reset}>Retake Quiz</button>
      </div>
    </div>
  );

  return (
    <div className="panel quiz-panel">
      <div className="quiz-header">
        <h2 className="quiz-header__title">Quiz</h2>
        <span className="quiz-header__counter">{docTitle}</span>
      </div>

      <div className="quiz-progress-bar">
        <div className="quiz-progress-bar__fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="quiz-card">
        <div className="quiz-card__q-num">Question {current + 1}</div>
        <div className="quiz-card__question">{q.q}</div>
        <div className="quiz-options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`quiz-option ${
                selected !== null
                  ? i === q.correct
                    ? 'quiz-option--correct'
                    : selected === i
                      ? 'quiz-option--wrong'
                      : ''
                  : ''
              }`}
              onClick={() => choose(i)}
              disabled={selected !== null}
            >
              <div className="quiz-option__letter">{String.fromCharCode(65 + i)}</div>
              {opt}
            </button>
          ))}
        </div>
        <div className="quiz-nav">
          <button className="btn-secondary" disabled>← Previous</button>
          {selected !== null && (
            <button className="btn-accent" onClick={next}>
              {current + 1 >= QUIZ_QUESTIONS.length ? 'Finish' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}