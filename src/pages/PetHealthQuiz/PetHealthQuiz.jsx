import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  QUIZ_CATEGORIES,
  MOCK_PRODUCTS,
  calculateQuizResult,
  getRecommendedProductsByTags,
} from './quizData'
import { useAuth } from '../../context/AuthContext'
import SharedNav from '../../components/SharedNav/SharedNav'
import { QUIZ_ICONS } from './quizShared'
import './PetHealthQuiz.css'
import pethealthcheck from '../../assets/pethealthcheck.jpg'
const HERO_IMAGE = pethealthcheck

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

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
const ICONS = QUIZ_ICONS

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
function QuizRunner({ category, onBack, onComplete, isSubmitting }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [isExiting, setIsExiting] = useState(false)

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
      setIsExiting(true)
      setTimeout(() => {
        setCurrentIndex(i => i + 1)
        setIsExiting(false)
      }, 200)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsExiting(true)
      setTimeout(() => {
        setCurrentIndex(i => i - 1)
        setIsExiting(false)
      }, 200)
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

      <div className={`quiz-runner__question-wrap ${isExiting ? 'exit' : ''}`}>
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
            disabled={!canProceed || isSubmitting}
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

/** Main page */
export default function PetHealthQuiz() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [view, setView] = useState('categories') // categories | quiz
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoriesRef, animateCategories] = useScrollReveal()

  const [submitState, setSubmitState] = useState(null) // null | 'submitting' | 'done' | 'error'
  const [submitError, setSubmitError] = useState('')
  const [pendingQuizData, setPendingQuizData] = useState(null)

  const [pets, setPets] = useState([])
  const [selectedPet, setSelectedPet] = useState(null)
  const [showPetList, setShowPetList] = useState(false)
  const [petLoading, setPetLoading] = useState(true)

  useEffect(() => {
    if (user?.userId && token) {
      fetchPets()
    } else {
      setPetLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPetList && !event.target.closest('.pq-selector') && !event.target.closest('.pq-pet-list')) {
        setShowPetList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPetList])

  const fetchPets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Pet/user/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        const petList = Array.isArray(data) ? data : (data ? [data] : [])
        setPets(petList)
        if (petList.length > 0) {
          if (!selectedPet || !petList.find(p => p.petId === selectedPet.petId)) {
            setSelectedPet(petList[0])
          }
        } else {
          setSelectedPet(null)
        }
      }
    } catch (err) {
      console.log('Error fetching pets')
    } finally {
      setPetLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'P'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleSelectPet = (pet) => {
    setSelectedPet(pet)
    setShowPetList(false)
  }

  const handleStart = (category) => {
    setSelectedCategory(category)
    setView('quiz')
  }

  const handleExitQuiz = () => {
    window.location.href = '/pet-health-quiz'
  }

  const TAG_TO_CATEGORIES = {
    toy: [2], comfort: [2], 'stress-relief': [2], calming: [2],
    probiotic: [1], digestive: [1], food: [1],
    'skin-care': [3], shampoo: [3], allergy: [3],
    joint: [4], mobility: [4], 'pain-relief': [4],
    respiratory: [4], vitamin: [4], energy: [4], immunity: [4],
    supplement: [4],
  }

  const getCategoryIdsFromTags = (tags) => {
    const ids = new Set()
    ;(tags || []).forEach(tag => {
      const cats = TAG_TO_CATEGORIES[tag]
      if (cats) cats.forEach(id => ids.add(id))
    })
    return ids
  }

  const fetchRecommendedProducts = async (categoryTags) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Product`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) return []
      const allProducts = await res.json()
      const catIds = getCategoryIdsFromTags(categoryTags)
      if (catIds.size === 0) return []

      return allProducts
        .filter(p => catIds.has(p.category))
        .slice(0, 6)
        .map(p => ({
          id: String(p.productId),
          name: p.name,
          image: p.thumbnailUrl || p.images?.[0] || '',
          price: p.price,
          category: p.category !== undefined && p.category !== null ? String(p.category) : '',
          reason: `Recommended for ${(categoryTags || []).join(', ')} needs`,
        }))
    } catch {
      return []
    }
  }

  const buildAssessmentPayload = (data, realRecommended) => {
    const tagSet = new Set()
    if (Array.isArray(data.category?.recommendedProductTags)) {
      data.category.recommendedProductTags.forEach(t => tagSet.add(t))
    }
    ;(realRecommended || []).forEach(p => {
      if (p.category) tagSet.add(p.category)
    })

    return {
      petId: selectedPet?.petId ?? 0,
      quizCategoryId: data.category?.id ?? '',
      quizCategoryTitle: data.category?.title ?? '',
      answers: data.answers.map(a => ({
        questionId: a.questionId,
        questionText: a.questionText,
        selectedOptionLabel: a.selectedOptionLabel,
        score: a.score,
      })),
      totalScore: data.result.totalScore,
      maxScore: data.result.maxScore,
      scorePercent: data.result.scorePercent,
      result: {
        level: data.result.level,
        severity: data.result.severity,
        summary: data.result.summary,
        advice: data.result.advice,
      },
      recommendedProductTags: Array.from(tagSet),
      recommendedProducts: (realRecommended || []).map(p => ({
        id: String(p.id),
        name: p.name,
        image: p.image,
        price: p.price,
        category: p.category !== undefined && p.category !== null ? String(p.category) : '',
        reason: p.reason,
      })),
    }
  }

  const submitAssessment = async (data) => {
    setSubmitState('submitting')
    setSubmitError('')
    const categoryTags = data.category?.recommendedProductTags || []

    const [realRecommended] = await Promise.all([
      fetchRecommendedProducts(categoryTags),
    ])

    const dataWithRealProducts = { ...data, recommended: realRecommended }
    setPendingQuizData(dataWithRealProducts)

    const payload = buildAssessmentPayload(data, realRecommended)
    console.log('Assessment payload:', JSON.stringify(payload, null, 2))
    try {
      const res = await fetch(`${API_BASE_URL}/api/PetHealthAssessment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        let errBody = ''
        try { errBody = await res.text() } catch {}
        console.error('Assessment API error body:', errBody)
        throw new Error(`HTTP ${res.status}: ${errBody}`)
      }
      setSubmitState('done')
    } catch (err) {
      console.error('Failed to save assessment:', err)
      setSubmitError('Unable to save your result right now. Showing result anyway.')
      setSubmitState('error')
    }
  }

  const closePopupAndShowResult = () => {
    const data = pendingQuizData
    setSubmitState(null)
    setSubmitError('')
    setPendingQuizData(null)
    if (data) navigate('/pet-health-quiz/result', { state: { quizData: data } })
  }

  const closePopupOnly = () => {
    setSubmitState(null)
    setSubmitError('')
    setPendingQuizData(null)
  }

  const handleComplete = (data) => {
    submitAssessment(data)
  }

  const handleRestart = () => {
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

      {/* Pet Selector (giống PetProfile) */}
      {!petLoading && pets.length > 0 && (
        <div className="pq-selector-wrap">
          <span className="pq-selector-label">Pet for this check</span>
          <div className="pq-selector">
            <button className="pq-selector-btn" onClick={() => setShowPetList(!showPetList)}>
              {selectedPet?.avatarUrl ? (
                <img src={selectedPet.avatarUrl} alt="" className="pq-selector-avatar" />
              ) : (
                <div className="pq-selector-avatar-placeholder">{getInitials(selectedPet?.name)}</div>
              )}
              <div className="pq-selector-info">
                <span className="pq-selector-name">{selectedPet?.name || 'Select Pet'}</span>
                <span className="pq-selector-species">{selectedPet?.species || ''}</span>
              </div>
              <span className="pq-selector-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            {showPetList && (
              <div className="pq-pet-list">
                {pets.map((pet) => (
                  <div
                    key={pet.petId}
                    className={`pq-pet-list-item ${selectedPet?.petId === pet.petId ? 'active' : ''}`}
                    onClick={() => handleSelectPet(pet)}
                  >
                    {pet.avatarUrl ? (
                      <img src={pet.avatarUrl} alt="" className="pq-pet-list-avatar" />
                    ) : (
                      <div className="pq-pet-list-avatar-placeholder">{getInitials(pet.name)}</div>
                    )}
                    <div className="pq-pet-list-info">
                      <span className="pq-pet-list-name">{pet.name}</span>
                      <span className="pq-pet-list-species">{pet.species}</span>
                    </div>
                    {selectedPet?.petId === pet.petId && (
                      <span className="pq-pet-list-check">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
              <button className="quiz-runner__exit" onClick={handleExitQuiz}>
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
              isSubmitting={submitState === 'submitting'}
            />
          </div>
        )}
      </section>

      {/* Submit status popup */}
      {submitState && (
        <div className="pq-modal-overlay" onClick={submitState === 'submitting' ? undefined : closePopupOnly}>
          <div className="pq-done-modal" onClick={(e) => e.stopPropagation()}>
            {submitState === 'submitting' && (
              <>
                <div className="pq-done-modal__spinner" />
                <h3>Saving your result…</h3>
                <p>Please wait a moment while we save your health check to your pet's history.</p>
              </>
            )}

            {submitState === 'done' && (
              <>
                <div className="pq-done-modal__check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>Quiz completed!</h3>
                <p>Your health check has been saved to <strong>{selectedPet?.name || 'your pet'}'s</strong> history.</p>
                <button className="pq-done-modal__btn" onClick={closePopupAndShowResult}>
                  View Result
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {submitState === 'error' && (
              <>
                <div className="pq-done-modal__warn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <h3>Couldn't save result</h3>
                <p>{submitError}</p>
                <button className="pq-done-modal__btn" onClick={closePopupAndShowResult}>
                  Continue to Result
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
