import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

/** Score counter hook — animates 0 → target over duration */
function useScoreCounter(target, duration = 1500) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    setDisplayed(0)
    const start = performance.now()
    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return displayed
}

/** Icon map */
export const QUIZ_ICONS = {
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
export const QUIZ_SEVERITY_COLORS = {
  low: '#007d48',
  medium: '#b45309',
  high: '#c2410c',
  critical: '#b91c1c',
}

export const formatVND = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

/** Shared result renderer — used by both embedded & standalone result pages */
export function QuizResultView({ quizData, onRestart, onViewProducts, retakeHref }) {
  const { category, result, recommended } = quizData
  const severityColor = QUIZ_SEVERITY_COLORS[result.severity] || '#111'

  const scorePercent = result.scorePercent
  const displayedScore = useScoreCounter(scorePercent, 1500)
  const circumference = 2 * Math.PI * 72
  const dashOffset = circumference - (displayedScore / 100) * circumference

  const handleRetake = () => {
    if (onRestart) onRestart()
    else if (retakeHref) window.location.href = retakeHref
  }

  return (
    <div className="quiz-result">
      {/* Header */}
      <div className="quiz-result__header">
        <div className="quiz-result__cat-info">
          <span className="quiz-result__cat-icon">
            {QUIZ_ICONS[category.icon] || QUIZ_ICONS.paw}
          </span>
          <div>
            <p className="quiz-result__cat-label">Assessment Complete</p>
            <h2 className="quiz-result__cat-title">{category.title}</h2>
          </div>
        </div>
        <button className="quiz-result__restart-btn" onClick={handleRetake}>
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
              {displayedScore}%
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
          <div className="quiz-result__products-grid is-visible">
            {recommended.map(product => (
              <div key={product.id} className="quiz-product-card">
                <div className="quiz-product-card__image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="quiz-product-card__body">
                  <p className="quiz-product-card__name">{product.name}</p>
                  <p className="quiz-product-card__reason">{product.reason}</p>
                  <p className="quiz-product-card__price">{formatVND(product.price)}</p>
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
        <button className="quiz-action-btn quiz-action-btn--secondary" onClick={handleRetake}>
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