import { useState, useEffect, useRef } from 'react'

/** Custom hook — debounces a value */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debounced
}

/** Custom hook — IntersectionObserver wrapper */
export function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, { threshold: 0.1, rootMargin: '50px', ...options })

    observer.observe(el)
    return () => observer.disconnect()
  }, [inView, options])

  return [ref, inView]
}