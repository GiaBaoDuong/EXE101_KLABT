import { useLocation, useNavigate } from 'react-router-dom'
import SharedNav from '../../components/SharedNav/SharedNav'
import { QuizResultView } from './quizShared'
import './PetHealthQuiz.css'
import './PetHealthQuizResult.css'

export default function PetHealthQuizResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const quizData = location.state?.quizData

  if (!quizData) {
    return (
      <>
        <SharedNav />
        <div className="quiz-result-page quiz-result-page--empty">
          <div className="quiz-result-empty">
            <h2>No quiz result found</h2>
            <p>It looks like you opened this page directly without completing a quiz.</p>
            <button
              className="quiz-result-empty__btn"
              onClick={() => navigate('/pet-health-quiz')}
            >
              Take a Quiz
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SharedNav />
      <div className="quiz-result-page">
        <section className="quiz-result-page__content">
          <QuizResultView
            quizData={quizData}
            retakeHref="/pet-health-quiz"
          />
        </section>
      </div>
    </>
  )
}