import { useRef, useState, useEffect, useMemo } from 'react'
import './VirtualList.css'

/** VirtualList — renders only visible items for performance */
export default function VirtualList({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  height = 600,
}) {
  const scrollRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = items.length * itemHeight

  const { start, end, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(height / itemHeight)
    const end = Math.min(items.length, start + visibleCount + overscan * 2)
    const offsetY = start * itemHeight
    return { start, end, offsetY }
  }, [scrollTop, items.length, itemHeight, height, overscan])

  const visible = items.slice(start, end)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setScrollTop(el.scrollTop)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={scrollRef}
      className={`virtual-list ${className}`}
      style={{ height }}
    >
      <div className="virtual-list__inner" style={{ height: totalHeight }}>
        <div className="virtual-list__items" style={{ transform: `translateY(${offsetY}px)` }}>
          {visible.map((item, i) => (
            <div
              key={start + i}
              className="virtual-list__item"
              style={{ height: itemHeight }}
            >
              {renderItem(item, start + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}