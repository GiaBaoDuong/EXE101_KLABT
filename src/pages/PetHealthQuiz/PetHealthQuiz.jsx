import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  QUIZ_CATEGORIES,
  MOCK_PRODUCTS,
  calculateQuizResult,
  getRecommendedProductsByTags,
} from './quizData'
import SharedNav from '../../components/SharedNav/SharedNav'
import './PetHealthQuiz.css'

const HERO_IMAGE = '../../src/assets/pethealthcheck.jpg'

/* Scroll Reveal Hook */
function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const isVisibleRef = useRef(false)
  const animateCardsRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const fn = () => {
      const cards = el.querySelectorAll('.quiz-category-card:not(.is-visible)')
      cards.forEach(card => card.classList.add('is-visible'))
    }
    animateCardsRef.current = fn

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          isVisibleRef.current = true
          fn()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px', ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const triggerAnimate = () => {
    if (isVisibleRef.current && animateCardsRef.current) {
      animateCardsRef.current()
    }
  }

  return [ref, triggerAnimate]
}

/** Icon map */
const ICONS = {
  brain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5Z"/>
      <path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.98 3 2.5 2.5 0 0 1 1.32 4.24 3 3 0 0 1-.34 5.58 2.5 2.5 0 0 1-2.96 3.08 2.5 2.5 0 0 1-4.91.05L12 20V4.5Z"/>
      <path d="M12 4.5V20"/><path d="M12 12c-3 0-6 2-6 6"/><path d="M12 12c3 0 6 2 6 6"/>
    </svg>
  ),
  stomach: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z"/>
      <circle cx="12" cy="9" r="2"/>
    </svg>
  ),
  paw: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/>
      <circle cx="20" cy="16" r="2"/><circle cx="4" cy="16" r="2"/>
      <path d="M12 10c-3 0-6 3-6 6v2h12v-2c0-3-3-6-6-6Z"/>
    </svg>
  ),
  bone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 1.68.65 3.21 1.69 4.33"/>
      <path d="M7 10c-.7-.7-1.69 0-2.5 0a2.5 2.5 0 0 1 0 5 .5.5 0 0 0 .5.5 2.5 2.5 0 1 0 5 0c0-1.68-.65-3.21-1.69-4.33"/>
      <path d="M8.5 14.5c1.17 0 2-.5 2-2s-.83-2-2-2-2 .5-2 2 .83 2 2 2Z"/>
      <path d="M15.5 14.5c1.17 0 2-.5 2-2s-.83-2-2-2-2 .5-2 2 .83 2 2 2Z"/>
    </svg>
  ),
  lungs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4C8 4 5 8 5 12v3c0 4 3 7 7 7s7-3 7-7v-3c0-4-3-8-7-8Z"/>
      <path d="M9 12h6"/><path d="M12 8v8"/>
      <path d="M9 12V8c0-1.66 1.34-3 3-3"/>
      <path d="M15 12V8c0-1.66-1.34-3-3-3"/>
    </svg>
  ),
}

/** Severity colors */
const SEVERITY_COLORS = {
  low: '#007d48',
  medium: '#b45309',
  high: '#c2410c',
  critical: '#b91c1c',
}

/** Category card */
function CategoryCard({ category, onStart }) {
  return (
    <div className="quiz-category-card">
      <div className="quiz-category-card__icon">
        {ICONS[category.icon] || ICONS.paw}
      </div>
      <div className="quiz-category-card__body">
        <h3 className="quiz-category-card__title">{category.title}</h3>
        <p className="quiz-category-card__desc">{category.description}</p>
        <p className="quiz-category-card__count">
          {category.questions.length} questions
        </p>
      </div>
      <button className="quiz-category-card__btn" onClick={() => onStart(category)}>
        Start Quiz
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  )
}

/** Progress bar */
/** Step indicator */
function StepIndicator({ current, total }) {
  return (
    <div className="quiz-steps">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1
        const isActive = stepNum === current
        const isDone = stepNum < current
        return (
          <div
            key={i}
            className={`quiz-step ${isActive ? 'quiz-step--active' : ''} ${isDone ? 'quiz-step--done' : ''}`}
          >
            <div className="quiz-step__dot">
              {isDone ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : stepNum}
            </div>
            {i < total - 1 && <div className="quiz-step__bar" />}
          </div>
        )
      })}
    </div>
  )
}

/** Option button */
function OptionButton({ option, selected, onSelect }) {
  return (
    <button
      className={`quiz-option ${selected ? 'quiz-option--selected' : ''}`}
      onClick={() => onSelect(option)}
    >
      <span className="quiz-option__radio">
        {selected && <span className="quiz-option__radio-dot" />}
      </span>
      <span className="quiz-option__label">{option.label}</span>
    </button>
  )
}

/** Quiz runner */
function QuizRunner({ category, onBack, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])

  const question = category.questions[currentIndex]
  const currentAnswer = answers.find(a => a.questionId === question.id)
  const totalQuestions = category.questions.length

  const handleSelect = (option) => {
    const newAnswers = [
      ...answers.filter(a => a.questionId !== question.id),
      {
        questionId: question.id,
        questionText: question.questionText,
        selectedOptionLabel: option.label,
        score: option.score,
      },
    ]
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(i => i + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }

  const handleSubmit = () => {
    const result = calculateQuizResult(answers, category.resultRules)
    const recommended = getRecommendedProductsByTags(
      category.recommendedProductTags,
      MOCK_PRODUCTS
    )
    onComplete({ category, answers, result, recommended })
  }

  const canProceed = currentAnswer !== undefined
  const isLast = currentIndex === totalQuestions - 1

  return (
    <div className="quiz-runner">
      <StepIndicator current={currentIndex + 1} total={totalQuestions} />

      <div className="quiz-runner__question-wrap">
        <p className="quiz-runner__question-num">Question {currentIndex + 1}</p>
        <h2 className="quiz-runner__question-text">{question.questionText}</h2>

        <div className="quiz-runner__options">
          {question.options.map((opt, i) => (
            <OptionButton
              key={i}
              option={opt}
              selected={currentAnswer?.selectedOptionLabel === opt.label}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      <div className="quiz-runner__nav">
        <button
          className="quiz-nav-btn quiz-nav-btn--prev"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Previous
        </button>

        {isLast ? (
          <button
            className="quiz-nav-btn quiz-nav-btn--submit"
            onClick={handleSubmit}
            disabled={!canProceed}
          >
            See Results
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        ) : (
          <button
            className="quiz-nav-btn quiz-nav-btn--next"
            onClick={handleNext}
            disabled={!canProceed}
          >
            Next
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/** Result page */
function QuizResult({ quizData, onRestart, onViewProducts }) {
  const { category, result, recommended } = quizData
  const severityColor = SEVERITY_COLORS[result.severity] || '#111'

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  const scorePercent = result.scorePercent
  const circumference = 2 * Math.PI * 72
  const dashOffset = circumference - (scorePercent / 100) * circumference

  return (
    <div className="quiz-result">
      {/* Header */}
      <div className="quiz-result__header">
        <div className="quiz-result__cat-info">
          <span className="quiz-result__cat-icon">
            {ICONS[category.icon] || ICONS.paw}
          </span>
          <div>
            <p className="quiz-result__cat-label">Assessment Complete</p>
            <h2 className="quiz-result__cat-title">{category.title}</h2>
          </div>
        </div>
        <button className="quiz-result__restart-btn" onClick={onRestart}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Retake
        </button>
      </div>

      {/* Score section */}
      <div className="quiz-result__score-section">
        <div className="quiz-result__score-ring-wrap">
          <svg className="quiz-result__score-ring" viewBox="0 0 160 160">
            <circle
              className="quiz-result__score-track"
              cx="80" cy="80" r="72"
              fill="none" strokeWidth="8"
            />
            <circle
              className="quiz-result__score-fill"
              cx="80" cy="80" r="72"
              fill="none"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 72}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ stroke: severityColor }}
            />
          </svg>
          <div className="quiz-result__score-inner">
            <span className="quiz-result__score-pct" style={{ color: severityColor }}>
              {scorePercent}%
            </span>
            <span className="quiz-result__score-label">
              {result.totalScore}/{result.maxScore}
            </span>
          </div>
        </div>

        <div className="quiz-result__score-meta">
          <div className="quiz-result__level-badge">
            <span className="quiz-result__level-dot" style={{ background: severityColor }} />
            <span className="quiz-result__level-text">{result.level}</span>
          </div>
          <p className="quiz-result__condition-label">Health Status</p>
          <h3 className="quiz-result__condition-text">{result.summary}</h3>
        </div>
      </div>

      {/* Info rows */}
      <div className="quiz-result__body">
        <div className="quiz-result__row">
          <div className="quiz-result__row-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="quiz-result__row-content">
            <p className="quiz-result__row-label">Care Recommendations</p>
            <p className="quiz-result__row-text">{result.advice}</p>
          </div>
        </div>

        {(result.severity === 'high' || result.severity === 'critical') && (
          <div className="quiz-result__disclaimer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <p>
              This is an initial screening tool for reference only, <strong>not an official medical diagnosis</strong>.
              Please take your pet to a veterinarian for an accurate evaluation.
            </p>
          </div>
        )}
      </div>

      {/* Recommended products */}
      {recommended.length > 0 && (
        <div className="quiz-result__products">
          <h3 className="quiz-result__products-title">Recommended Products</h3>
          <div className="quiz-result__products-grid">
            {recommended.map(product => (
              <div key={product.id} className="quiz-product-card">
                <div className="quiz-product-card__image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="quiz-product-card__body">
                  <p className="quiz-product-card__name">{product.name}</p>
                  <p className="quiz-product-card__reason">{product.reason}</p>
                  <p className="quiz-product-card__price">{formatPrice(product.price)}</p>
                  <Link to={`/products/${product.id}`} className="quiz-product-card__btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {onViewProducts && (
            <button className="quiz-result__view-all" onClick={onViewProducts}>
              View All Products
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="quiz-result__actions">
        <button className="quiz-action-btn quiz-action-btn--secondary" onClick={onRestart}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Retake Quiz
        </button>
        <Link to="/products" className="quiz-action-btn quiz-action-btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Browse Products
        </Link>
      </div>
    </div>
  )
}

/** Main page */
export default function PetHealthQuiz() {
  const [view, setView] = useState('categories') // categories | quiz | result
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [quizData, setQuizData] = useState(null)
  const [categoriesRef, animateCategories] = useScrollReveal()

  const handleStart = (category) => {
    setSelectedCategory(category)
    setView('quiz')
  }

  const handleComplete = (data) => {
    setQuizData(data)
    setView('result')
  }

  const handleRestart = () => {
    setQuizData(null)
    setSelectedCategory(null)
    setView('categories')
  }

  return (
    <>
      <SharedNav />
      <div className={`pet-health-quiz pet-health-quiz--${view}`}>
      {/* Hero */}
      <section className="quiz-hero">
        <img src={HERO_IMAGE} alt="Pet health check" className="quiz-hero__bg" />
        <div className="quiz-hero__overlay" />
        <div className="quiz-hero__content">
          <p className="quiz-hero__eyebrow">Pet Health Check</p>
          <h1 className="quiz-hero__title">
            Pet Health<br />Check
          </h1>
          <p className="quiz-hero__sub">
            Quickly assess your pet's condition through specialized quiz assessments.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="quiz-content">
        {view === 'categories' && (
          <div className="quiz-categories">
            <div className="quiz-categories__header">
              <h2 className="quiz-categories__title">Choose a Quiz</h2>
              <p className="quiz-categories__sub">
                Each quiz contains {QUIZ_CATEGORIES[0]?.questions.length} multiple-choice questions.
                Results are for reference only and do not replace a veterinary diagnosis.
              </p>
            </div>
            <div className="quiz-categories__grid reveal" ref={categoriesRef}>
              {QUIZ_CATEGORIES.map(cat => (
                <CategoryCard key={cat.id} category={cat} onStart={handleStart} />
              ))}
            </div>
          </div>
        )}

        {view === 'quiz' && selectedCategory && (
          <div className="quiz-content__inner">
            <div className="quiz-content__header">
              <div className="quiz-content__cat-info">
                <span className="quiz-content__cat-icon">
                  {ICONS[selectedCategory.icon] || ICONS.paw}
                </span>
                <div>
                  <p className="quiz-content__cat-label">Health Check</p>
                  <h2 className="quiz-content__cat-title">{selectedCategory.title}</h2>
                </div>
              </div>
              <button className="quiz-runner__exit" onClick={handleRestart}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Exit
              </button>
            </div>
            <QuizRunner
              category={selectedCategory}
              onBack={handleRestart}
              onComplete={handleComplete}
            />
          </div>
        )}

        {view === 'result' && quizData && (
          <div className="quiz-content__inner">
            <QuizResult
              quizData={quizData}
              onRestart={handleRestart}
              onViewProducts={() => {}}
            />
          </div>
        )}
      </section>
    </div>
    </>
  )
}
