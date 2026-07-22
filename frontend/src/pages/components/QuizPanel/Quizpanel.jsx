import { useState } from 'react';
import { auth } from "@/firebase/config";
import { buildApiUrl } from "@/lib/api";
import { CheckCircle2, XCircle, Sparkles, BookOpen, Gauge, ListOrdered } from "lucide-react";
import './Quizpanel.css';

export default function QuizPanel({ doc, documents }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [quizGenerated, setQuizGenerated] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState("");

  const [requirement, setRequirement] = useState("");

  const [difficulty, setDifficulty] = useState("medium");

  const [questionCount, setQuestionCount] = useState(10);

  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [questions, setQuestions] = useState([]);

  const selectedDoc =
    documents?.find(d => d.id == selectedDocument);

  const docTitle = selectedDoc?.file_name || "Current document";

  const q = questions[current] || {};

const progress =
  questions.length > 0
    ? ((current + 1) / questions.length) * 100
    : 0;

  const choose = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) setScore(s => s + 1);
  };

  const generateQuiz = async () => {

    if(!selectedDocument){

        alert("Select a document");

        return;
    }

    setLoadingQuiz(true);

    try{

        if (!auth.currentUser) {
          alert("Please login first.");
          return;
        }

        const token = await auth.currentUser.getIdToken();

        const response = await fetch(
            buildApiUrl("/ai/generate/"),
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                },

                body:JSON.stringify({

                    document_id:selectedDocument,

                    requirement,

                    difficulty,

                    question_count:questionCount

                })

            }
        );

        const data=await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No quiz questions were returned.");
      }
      
      setQuestions(data.questions);
      setQuizGenerated(true);

    }
    catch(err){

        console.log(err);

    }
    finally{

        setLoadingQuiz(false);

    }

}
  const next = () => {
    if (current + 1 >= questions.length) {
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

    setQuizGenerated(false);

    setQuestions([]);

    setSelectedDocument("");

    setRequirement("");

    setDifficulty("medium");

    setQuestionCount(10);
}
  if (done) return (
    <div className="panel quiz-panel">
      <div className="quiz-result">
        <div className="quiz-result__emoji">{score === questions.length ? '🏆' : '🎯'}</div>
        <div className="quiz-result__score">{score}/{questions.length} Correct</div>
        <p className="quiz-result__msg">
          {score === questions.length
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
        <div>
          <h2 className="quiz-header__title">
            <Sparkles size={20} strokeWidth={2} />
            Quiz
          </h2>
        </div>
        <span className="quiz-header__counter">{docTitle}</span>
      </div>

      {!quizGenerated && (
        <div className="quiz-generator">
          <h2 className="quiz-generator__title">Generate AI Quiz</h2>
          <p className="quiz-generator__sub">Pick a document and let AI build your quiz.</p>

          <div className="quiz-form">

            <div className="quiz-form__group">
              <label><BookOpen size={14} strokeWidth={2.5} /> Select Document</label>
              <select
                value={selectedDocument}
                onChange={(e) => setSelectedDocument(e.target.value)}
              >
                <option value="">Choose Document</option>
                {documents?.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.file_name}</option>
                ))}
              </select>
            </div>

            <div className="quiz-form__group">
              <label>Topic / Requirement</label>
              <textarea
                rows="4"
                placeholder="Examples: Memory Management"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
              />
            </div>

            <div className="quiz-form__row">
              <div className="quiz-form__group">
                <label><Gauge size={14} strokeWidth={2.5} /> Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="quiz-form__group">
                <label><ListOrdered size={14} strokeWidth={2.5} /> Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                >
                  <option>5</option>
                  <option>10</option>
                  <option>15</option>
                  <option>20</option>
                </select>
              </div>
            </div>

            <button
              className="btn-accent quiz-generator__btn"
              onClick={generateQuiz}
              disabled={loadingQuiz}
            >
              {loadingQuiz ? (
                <>Generating<span className="quiz-dots"><span>.</span><span>.</span><span>.</span></span></>
              ) : (
                <><Sparkles size={15} strokeWidth={2.5} /> Generate Quiz</>
              )}
            </button>

          </div>
        </div>
      )}

      {quizGenerated && (
        <>
          <div className="quiz-progress">
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-bar__fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="quiz-progress__label">{current + 1} / {questions.length}</span>
          </div>

          <div className="quiz-card">

            <div className="quiz-card__q-num">Question {current + 1}</div>
            <div className="quiz-card__question">{q.question}</div>

            <div className="quiz-options">
              {q.options?.map((opt, i) => {
                const isCorrect = selected !== null && i === q.correct;
                const isWrong = selected !== null && selected === i && i !== q.correct;

                return (
                  <button
                    key={i}
                    className={`quiz-option ${isCorrect ? "quiz-option--correct" : isWrong ? "quiz-option--wrong" : ""}`}
                    onClick={() => choose(i)}
                    disabled={selected !== null}
                  >
                    <div className="quiz-option__letter">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="quiz-option__text">{opt}</span>
                    {isCorrect && <CheckCircle2 className="quiz-option__icon" size={20} strokeWidth={2.2} />}
                    {isWrong && <XCircle className="quiz-option__icon" size={20} strokeWidth={2.2} />}
                  </button>
                );
              })}
            </div>

            <div className="quiz-nav">
              <button
                className="btn-secondary"
                disabled={current === 0}
                onClick={() => {
                  if (current > 0) {
                    setCurrent(current - 1);
                    setSelected(null);
                  }
                }}
              >
                ← Previous
              </button>

              {selected !== null && (
                <button className="btn-accent" onClick={next}>
                  {current + 1 >= questions.length ? "Finish" : "Next →"}
                </button>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}