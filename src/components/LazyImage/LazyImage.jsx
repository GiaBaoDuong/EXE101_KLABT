import { useState } from 'react'
import { useInView } from '../../hooks/performanceHooks'
import './LazyImage.css'

/** LazyImage — only loads when in viewport */
export default function LazyImage({ src, alt, className = '', style = {}, placeholder }) {
  const [ref, inView] = useInView()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div ref={ref} className={`lazy-image ${className}`} style={style}>
      {!loaded && !error && (
        <div className="lazy-image__placeholder">
          {placeholder || <div className="lazy-image__shimmer" />}
        </div>
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`lazy-image__img ${loaded ? 'is-loaded' : ''}`}
        />
      )}
      {error && <div className="lazy-image__error">Failed</div>}
    </div>
  )
}