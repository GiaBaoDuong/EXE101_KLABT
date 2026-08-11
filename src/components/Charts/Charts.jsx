// Lightweight SVG charts — no external library
// Design: matches Nike tokens (ink #111, soft-cloud #f5f5f5, hairline #cacacb, mute #707072)

// =============================================================================
// LINE / AREA CHART — revenue over time
// props: data [{label, values:{booking, order, membership}}], series [{key,label,color}], height
// =============================================================================
export function LineChart({ data = [], series = [], height = 220, formatValue = (v) => v }) {
  const width = 720
  const pad = { top: 24, right: 24, bottom: 36, left: 56 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  if (!data.length) return <EmptyChart height={height} />

  // Compute max value across all series
  let maxVal = 0
  data.forEach(d => {
    series.forEach(s => {
      const v = Number(d.values?.[s.key] || 0)
      if (v > maxVal) maxVal = v
    })
  })
  if (maxVal === 0) maxVal = 1
  // Round up to nice number for y-axis
  const niceMax = niceCeil(maxVal)

  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  // Y-axis ticks (4 ticks)
  const yTicks = 4
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => (niceMax / yTicks) * i)

  // Build path for each series
  const buildPath = (key) => {
    if (!data.length) return ''
    return data.map((d, i) => {
      const v = Number(d.values?.[key] || 0)
      const x = pad.left + i * stepX
      const y = pad.top + innerH - (v / niceMax) * innerH
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  // Build area path (close to bottom)
  const buildArea = (key) => {
    if (!data.length) return ''
    const points = data.map((d, i) => {
      const v = Number(d.values?.[key] || 0)
      const x = pad.left + i * stepX
      const y = pad.top + innerH - (v / niceMax) * innerH
      return `${x},${y}`
    })
    const firstX = pad.left
    const lastX = pad.left + (data.length - 1) * stepX
    return `M ${firstX} ${pad.top + innerH} L ${points.join(' L ')} L ${lastX} ${pad.top + innerH} Z`
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="ana-chart" preserveAspectRatio="xMidYMid meet">
      {/* Y-axis grid + labels */}
      {tickValues.map((tv, i) => {
        const y = pad.top + innerH - (tv / niceMax) * innerH
        return (
          <g key={i}>
            <line
              x1={pad.left} y1={y} x2={width - pad.right} y2={y}
              stroke="#e5e5e5" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 4'}
            />
            <text x={pad.left - 10} y={y + 4} fontSize="10" fill="#9e9ea0" textAnchor="end" fontFamily="Inter, sans-serif">
              {formatValue(tv)}
            </text>
          </g>
        )
      })}

      {/* Areas (stacked look, subtle) */}
      {series.map(s => (
        <path key={`area-${s.key}`} d={buildArea(s.key)} fill={s.color} fillOpacity="0.08" />
      ))}

      {/* Lines */}
      {series.map(s => (
        <path
          key={`line-${s.key}`}
          d={buildPath(s.key)}
          fill="none"
          stroke={s.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Dots */}
      {series.map(s =>
        data.map((d, i) => {
          const v = Number(d.values?.[s.key] || 0)
          const x = pad.left + i * stepX
          const y = pad.top + innerH - (v / niceMax) * innerH
          return (
            <circle key={`dot-${s.key}-${i}`} cx={x} cy={y} r="3" fill="#ffffff" stroke={s.color} strokeWidth="2" />
          )
        })
      )}

      {/* X-axis labels */}
      {data.map((d, i) => {
        const x = pad.left + i * stepX
        const showLabel = data.length <= 12 || i % Math.ceil(data.length / 8) === 0
        return showLabel ? (
          <text key={`xl-${i}`} x={x} y={height - pad.bottom + 18} fontSize="10" fill="#707072" textAnchor="middle" fontFamily="Inter, sans-serif">
            {d.label}
          </text>
        ) : null
      })}
    </svg>
  )
}

// =============================================================================
// STACKED BAR CHART — Booking / Order / Membership revenue
// =============================================================================
export function StackedBarChart({ data = [], series = [], height = 220, formatValue = (v) => v }) {
  const width = 720
  const pad = { top: 24, right: 16, bottom: 36, left: 56 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  if (!data.length) return <EmptyChart height={height} />

  let maxVal = 0
  data.forEach(d => {
    const total = series.reduce((s, sr) => s + Number(d.values?.[sr.key] || 0), 0)
    if (total > maxVal) maxVal = total
  })
  if (maxVal === 0) maxVal = 1
  const niceMax = niceCeil(maxVal)

  const barW = Math.min(40, (innerW / data.length) * 0.6)
  const stepX = innerW / data.length

  const yTicks = 4
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => (niceMax / yTicks) * i)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="ana-chart" preserveAspectRatio="xMidYMid meet">
      {tickValues.map((tv, i) => {
        const y = pad.top + innerH - (tv / niceMax) * innerH
        return (
          <g key={i}>
            <line
              x1={pad.left} y1={y} x2={width - pad.right} y2={y}
              stroke="#e5e5e5" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 4'}
            />
            <text x={pad.left - 10} y={y + 4} fontSize="10" fill="#9e9ea0" textAnchor="end" fontFamily="Inter, sans-serif">
              {formatValue(tv)}
            </text>
          </g>
        )
      })}

      {data.map((d, i) => {
        const xCenter = pad.left + i * stepX + stepX / 2
        const x = xCenter - barW / 2
        let yAcc = pad.top + innerH
        return (
          <g key={i}>
            {series.map((sr, j) => {
              const v = Number(d.values?.[sr.key] || 0)
              if (v === 0) return null
              const h = (v / niceMax) * innerH
              const yTop = yAcc - h
              const seg = (
                <rect
                  key={j}
                  x={x}
                  y={yTop}
                  width={barW}
                  height={h}
                  fill={sr.color}
                />
              )
              yAcc = yTop
              return seg
            })}
            <text x={xCenter} y={height - pad.bottom + 18} fontSize="10" fill="#707072" textAnchor="middle" fontFamily="Inter, sans-serif">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// =============================================================================
// HORIZONTAL BAR CHART — Top services
// props: data [{label, value, sub}], maxBar = 100 (% width)
// =============================================================================
export function HbBarChart({ data = [], height = 240, accent = '#111111' }) {
  if (!data.length) return <EmptyChart height={height} />
  const maxVal = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="ana-hbchart" style={{ minHeight: height }}>
      {data.map((d, i) => {
        const pct = (d.value / maxVal) * 100
        return (
          <div key={i} className="ana-hbchart__row">
            <div className="ana-hbchart__label">
              <span className="ana-hbchart__rank">{String(i + 1).padStart(2, '0')}</span>
              <span className="ana-hbchart__name">{d.label}</span>
            </div>
            <div className="ana-hbchart__barWrap">
              <div className="ana-hbchart__bar" style={{ width: `${pct}%`, background: accent }} />
            </div>
            <div className="ana-hbchart__value">{d.valueLabel || d.value}</div>
          </div>
        )
      })}
    </div>
  )
}

// =============================================================================
// DONUT CHART — booking status breakdown
// props: data [{label, count, color, bg}], size, centerLabel, centerSub
// =============================================================================
export function DonutChart({ data = [], size = 220, centerLabel, centerSub }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  const r = size / 2 - 12
  const innerR = r * 0.62
  const cx = size / 2
  const cy = size / 2
  const stroke = r - innerR

  if (total === 0) {
    return (
      <div className="ana-donut" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f5f5f5" strokeWidth={stroke} />
        </svg>
        <div className="ana-donut__center">
          <span className="ana-donut__num">0</span>
          {centerSub && <span className="ana-donut__sub">{centerSub}</span>}
        </div>
      </div>
    )
  }

  // Build arc segments
  let acc = 0
  const segments = data.map((d, i) => {
    const start = acc / total
    acc += d.count
    const end = acc / total
    const path = arcPath(cx, cy, r, start, end)
    return { path, color: d.color, key: i }
  })

  return (
    <div className="ana-donut" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f5f5f5" strokeWidth={stroke} />
        {segments.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="ana-donut__center">
        <span className="ana-donut__num">{total}</span>
        {centerLabel && <span className="ana-donut__lbl">{centerLabel}</span>}
        {centerSub && <span className="ana-donut__sub">{centerSub}</span>}
      </div>
    </div>
  )
}

// Arc path helper (Sweep circle)
function arcPath(cx, cy, r, startFrac, endFrac) {
  const startAngle = startFrac * 2 * Math.PI - Math.PI / 2
  const endAngle = endFrac * 2 * Math.PI - Math.PI / 2
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  const large = endFrac - startFrac > 0.5 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

// =============================================================================
// HELPERS
// =============================================================================
function niceCeil(v) {
  if (v <= 0) return 1
  const exp = Math.floor(Math.log10(v))
  const base = Math.pow(10, exp)
  const norm = v / base
  let nice
  if (norm <= 1) nice = 1
  else if (norm <= 2) nice = 2
  else if (norm <= 5) nice = 5
  else nice = 10
  return nice * base
}

function EmptyChart({ height = 200 }) {
  return (
    <div className="ana-chart-empty" style={{ height }}>
      <div className="ana-chart-empty__line" />
      <p>No data available</p>
    </div>
  )
}

// Format price compact (1.2M, 540K)
export function formatCompactPrice(v) {
  if (!v) return '0'
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K'
  return String(v)
}

export function formatPriceFull(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0)
}
