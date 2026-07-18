import { useState } from 'react';
import { auth } from "@/firebase/config";
import './Quizpanel.css';

export default function QuizPanel({ doc,documents }) {
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
            "http://127.0.0.1:8000/ai/generate/",
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
      <h2 className="quiz-header__title">Quiz</h2>
      <span className="quiz-header__counter">{docTitle}</span>
    </div>

    {!quizGenerated && (

<div className="quiz-generator">

    <h2>Generate AI Quiz</h2>

    <div className="quiz-form">

        <label>Select Document</label>

        <select
            value={selectedDocument}
            onChange={(e)=>setSelectedDocument(e.target.value)}
        >

            <option value="">Choose Document</option>

            {documents?.map(doc=>(
                <option
                    key={doc.id}
                    value={doc.id}
                >
                    {doc.file_name}
                </option>
            ))}

        </select>

        <label>Topic / Requirement</label>

        <textarea
            rows="4"
            placeholder="Examples: Memory Management "
            value={requirement}
            onChange={(e)=>setRequirement(e.target.value)}
        />

        <label>Difficulty</label>

        <select
            value={difficulty}
            onChange={(e)=>setDifficulty(e.target.value)}
        >

            <option value="easy">Easy</option>

            <option value="medium">Medium</option>

            <option value="hard">Hard</option>

        </select>

        <label>Questions</label>

        <select
            value={questionCount}
            onChange={(e)=>setQuestionCount(Number(e.target.value))}
        >

            <option>5</option>

            <option>10</option>

            <option>15</option>

            <option>20</option>

        </select>

        <button
            className="btn-accent"
            onClick={generateQuiz}
            disabled={loadingQuiz}
        >

            {loadingQuiz
                ? "Generating..."
                : "Generate Quiz"}

        </button>

    </div>

</div>

)}

    {quizGenerated && (
      <>
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-bar__fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="quiz-card">

          <div className="quiz-card__q-num">
            Question {current + 1}
          </div>

          <div className="quiz-card__question">
            {q.question}
          </div>

          <div className="quiz-options">

            {q.options?.map((opt, i) => (

              <button
                key={i}
                className={`quiz-option ${
                  selected !== null
                    ? i === q.correct
                      ? "quiz-option--correct"
                      : selected === i
                      ? "quiz-option--wrong"
                      : ""
                    : ""
                }`}
                onClick={() => choose(i)}
                disabled={selected !== null}
              >

                <div className="quiz-option__letter">
                  {String.fromCharCode(65 + i)}
                </div>

                {opt}

              </button>

            ))}

          </div>

          <div className="quiz-nav">

            <button
              className="btn-secondary"
              disabled={current === 0}
              onClick={() => {
                  if(current > 0){
                      setCurrent(current - 1);
                      setSelected(null);
                  }}}>
              ← Previous
            </button>

            {selected !== null && (

              <button
                className="btn-accent"
                onClick={next}
              >

                {current + 1 >= questions.length
                  ? "Finish"
                  : "Next →"}

              </button>

            )}

          </div>

        </div>
      </>
    )}

  </div>
);
}