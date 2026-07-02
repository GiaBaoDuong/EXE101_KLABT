import './Skeleton.css'

/** Skeleton — placeholder while loading */
export function Skeleton({ width, height, radius = '8px', className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

/** SkeletonText — multiple lines */
export function SkeletonText({ lines = 3, width = '100%' }) {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          width={i === lines - 1 ? '70%' : width}
          radius="4px"
        />
      ))}
    </div>
  )
}

/** SkeletonCard — product/pet card placeholder */
export function SkeletonCard({ height = '320px' }) {
  return (
    <div className="skeleton-card" style={{ height }}>
      <Skeleton height="60%" radius="12px 12px 0 0" />
      <div className="skeleton-card__body">
        <Skeleton height="16px" width="80%" radius="4px" />
        <Skeleton height="14px" width="60%" radius="4px" />
        <Skeleton height="20px" width="40%" radius="4px" />
      </div>
    </div>
  )
}

/** SkeletonGrid — multiple cards */
export function SkeletonGrid({ count = 6, cardHeight = '320px' }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={cardHeight} />
      ))}
    </div>
  )
}