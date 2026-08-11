import { useState, useEffect, useCallback } from 'react'
import {
  getDashboardSummary,
  getRevenueByPeriod,
  getBookingStats,
  getTopServices,
  normalizeSummary,
  normalizeRevenue,
  normalizeBookingStats,
  normalizeTopServices,
  PERIOD_LABEL,
} from '../../services/adminDashboardService'
import {
  LineChart,
  StackedBarChart,
  HbBarChart,
  DonutChart,
  formatCompactPrice,
  formatPriceFull,
} from '../../components/Charts/Charts'
import './Analytics.css'

// =============================================================================
// ICONS
// =============================================================================
const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
)

const IconArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
)

const IconArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19 12 12 19 5 12"/>
  </svg>
)

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)

// =============================================================================
// METRIC CARD — summary tile with growth arrow
// =============================================================================
function MetricCard({ label, value, growth, accent = 'ink' }) {
  const hasGrowth = typeof growth === 'number' && !isNaN(growth)
  const isUp = hasGrowth && growth > 0
  const isDown = hasGrowth && growth < 0
  const isFlat = hasGrowth && growth === 0
  return (
    <div className={`ana-metric ana-metric--${accent}`}>
      <span className="ana-metric__label">{label}</span>
      <span className="ana-metric__value">{value}</span>
      {hasGrowth && (
        <div className={`ana-metric__growth ${isUp ? 'is-up' : isDown ? 'is-down' : 'is-flat'}`}>
          {isUp && <IconArrowUp />}
          {isDown && <IconArrowDown />}
          <span>{isUp ? '+' : ''}{growth.toFixed(1)}%</span>
          <span className="ana-metric__growth-sub">vs prev period</span>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// SECTION HEADER
// =============================================================================
function SectionHeader({ eyebrow, title, sub, action }) {
  return (
    <div className="ana-section__head">
      <div>
        {eyebrow && <p className="ana-section__eyebrow">{eyebrow}</p>}
        <h2 className="ana-section__title">{title}</h2>
        {sub && <p className="ana-section__sub">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function Analytics() {
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [summary, setSummary] = useState(null)
  const [revenue, setRevenue] = useState({ points: [], grandTotal: 0, bookingTotal: 0, orderTotal: 0, membershipTotal: 0 })
  const [bookingStats, setBookingStats] = useState({ points: [], breakdown: [], total: 0 })
  const [topServices, setTopServices] = useState([])
  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    const [s, r, b, t] = await Promise.all([
      getDashboardSummary(period),
      getRevenueByPeriod(period),
      getBookingStats(period),
      getTopServices(10),
    ])

    if (s.success) setSummary(normalizeSummary(s.data))
    else setSummary(null)

    if (r.success) setRevenue(normalizeRevenue(r.data, period))
    else setRevenue({ points: [], grandTotal: 0, bookingTotal: 0, orderTotal: 0, membershipTotal: 0 })

    if (b.success) setBookingStats(normalizeBookingStats(b.data))
    else setBookingStats({ points: [], breakdown: [], total: 0 })

    if (t.success) setTopServices(normalizeTopServices(t.data))
    else setTopServices([])

    if (!s.success && !r.success && !b.success && !t.success) {
      setError('Failed to load analytics. Check API connection.')
    }
    setLoading(false)
  }, [period])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Revenue chart data (line + bar)
  const revenueSeries = [
    { key: 'booking',    label: 'Booking',    color: '#111111' },
    { key: 'order',      label: 'Order',      color: '#007d48' },
    { key: 'membership', label: 'Membership', color: '#1151ff' },
  ]
  const revenuePoints = revenue.points || []
  const revenueChartData = revenuePoints.map(r => ({
    label: r.label,
    values: { booking: r.booking, order: r.order, membership: r.membership },
  }))

  const totalRevenue      = revenue.grandTotal     || revenuePoints.reduce((s, r) => s + r.total, 0)
  const totalBookingRev   = revenue.bookingTotal   || revenuePoints.reduce((s, r) => s + r.booking, 0)
  const totalOrderRev     = revenue.orderTotal     || revenuePoints.reduce((s, r) => s + r.order, 0)
  const totalMemberRev    = revenue.membershipTotal|| revenuePoints.reduce((s, r) => s + r.membership, 0)

  // Top services -> horizontal bar
  const topServicesChart = topServices.slice(0, 8).map(s => ({
    label: s.name,
    value: s.revenue,
    valueLabel: formatPriceFull(s.revenue),
  }))

  const periodLabel = PERIOD_LABEL[period] || 'This Week'

  return (
    <div className="ana">
      <div className="ana-inner">
      {/* ============================================================
         HEADER
         ============================================================ */}
      <div className="ana-header">
        <div className="ana-header__left">
          <p className="ana-eyebrow">Admin · Analytics</p>
          <h1 className="ana-title">Dashboard</h1>
          <p className="ana-subtitle">Performance overview for {periodLabel.toLowerCase()}</p>
        </div>
        <div className="ana-header__right">
          <div className="ana-period" role="tablist" aria-label="Period">
            {['week', 'month', 'year'].map(p => (
              <button
                key={p}
                role="tab"
                aria-selected={period === p}
                className={`ana-period__btn${period === p ? ' active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Year'}
              </button>
            ))}
          </div>
          <button className="ana-refresh" onClick={loadAll} disabled={loading}>
            <IconRefresh />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      {error && (
        <div className="ana-error">
          <p>{error}</p>
          <button className="ana-btn ana-btn-primary" onClick={loadAll}>Retry</button>
        </div>
      )}

      {/* ============================================================
         SUMMARY METRICS — 5 cards
         ============================================================ */}
      <section className="ana-metrics">
        <MetricCard
          label="Total Revenue"
          value={formatPriceFull(summary?.totalRevenue || 0)}
          growth={summary?.revenueGrowth}
          accent="ink"
        />
        <MetricCard
          label="Bookings"
          value={summary?.totalBookings?.toLocaleString?.('en-US') || '0'}
          growth={summary?.bookingsGrowth}
          accent="purple"
        />
        <MetricCard
          label="Orders"
          value={summary?.totalOrders?.toLocaleString?.('en-US') || '0'}
          growth={summary?.ordersGrowth}
          accent="green"
        />
        <MetricCard
          label="Users"
          value={summary?.totalUsers?.toLocaleString?.('en-US') || '0'}
          growth={summary?.usersGrowth}
          accent="blue"
        />
        <MetricCard
          label="Pets"
          value={summary?.totalPets?.toLocaleString?.('en-US') || '0'}
          growth={summary?.petsGrowth}
          accent="orange"
        />
      </section>

      {/* ============================================================
         REVENUE — line chart + breakdown
         ============================================================ */}
      <section className="ana-block">
        <SectionHeader
          eyebrow="Revenue Breakdown"
          title="Revenue by Source"
          sub={`Total ${formatPriceFull(totalRevenue)} · Booking ${formatPriceFull(totalBookingRev)} · Order ${formatPriceFull(totalOrderRev)} · Membership ${formatPriceFull(totalMemberRev)}`}
          action={
            <div className="ana-legend">
              {revenueSeries.map(s => (
                <span key={s.key} className="ana-legend__item">
                  <span className="ana-legend__dot" style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
          }
        />
        <div className="ana-card">
          <LineChart
            data={revenueChartData}
            series={revenueSeries}
            height={260}
            formatValue={formatCompactPrice}
          />
        </div>
      </section>

      {/* ============================================================
         REVENUE — stacked bar chart (different view)
         ============================================================ */}
      <section className="ana-block">
        <SectionHeader
          eyebrow="Stacked View"
          title="Revenue Composition"
          sub="Cumulative revenue per period"
        />
        <div className="ana-card">
          <StackedBarChart
            data={revenueChartData}
            series={revenueSeries}
            height={240}
            formatValue={formatCompactPrice}
          />
        </div>
      </section>

      {/* ============================================================
         BOOKING STATUS — donut + breakdown
         ============================================================ */}
      <section className="ana-block">
        <SectionHeader
          eyebrow="Booking Status"
          title="Booking Distribution"
          sub={`${bookingStats.total.toLocaleString('en-US')} total bookings in ${periodLabel.toLowerCase()}`}
        />
        <div className="ana-grid-2">
          <div className="ana-card">
            <DonutChart
              data={bookingStats.breakdown}
              size={220}
              centerLabel="Total"
              centerSub="Bookings"
            />
          </div>
          <div className="ana-card">
            <div className="ana-status-list">
              {bookingStats.breakdown.length === 0 ? (
                <p className="ana-empty">No booking data</p>
              ) : (
                bookingStats.breakdown.map(b => {
                  const total = bookingStats.total || bookingStats.breakdown.reduce((s, x) => s + x.count, 0) || 1
                  const pct = ((b.count / total) * 100).toFixed(1)
                  return (
                    <div key={b.status} className="ana-status-row">
                      <div className="ana-status-row__left">
                        <span className="ana-status-dot" style={{ background: b.color }} />
                        <span className="ana-status-name">{b.label}</span>
                      </div>
                      <div className="ana-status-row__right">
                        <span className="ana-status-count">{b.count.toLocaleString('en-US')}</span>
                        <span className="ana-status-pct">{pct}%</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         BOOKING TREND — line chart by status (NEW: use data points)
         ============================================================ */}
      {bookingStats.points.length > 0 && (
        <section className="ana-block">
          <SectionHeader
            eyebrow="Trend"
            title="Bookings Over Time"
            sub={`Total bookings per ${period === 'week' ? 'day' : period === 'month' ? 'week' : 'month'}`}
            action={
              <div className="ana-legend">
                {[
                  { key: 'pending',    label: 'Pending',     color: '#e65100' },
                  { key: 'confirmed',  label: 'Confirmed',   color: '#0d47a1' },
                  { key: 'inProgress', label: 'In Progress', color: '#4527a0' },
                  { key: 'completed',  label: 'Completed',   color: '#1b5e20' },
                  { key: 'cancelled',  label: 'Cancelled',   color: '#707072' },
                ].map(s => (
                  <span key={s.key} className="ana-legend__item">
                    <span className="ana-legend__dot" style={{ background: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            }
          />
          <div className="ana-card">
            <LineChart
              data={bookingStats.points.map(p => ({
                label: p.label,
                values: { pending: p.pending, confirmed: p.confirmed, inProgress: p.inProgress, completed: p.completed, cancelled: p.cancelled },
              }))}
              series={[
                { key: 'confirmed',  label: 'Confirmed',   color: '#0d47a1' },
                { key: 'completed',  label: 'Completed',   color: '#1b5e20' },
                { key: 'inProgress', label: 'In Progress', color: '#4527a0' },
              ]}
              height={220}
              formatValue={(v) => String(Math.round(v))}
            />
          </div>
        </section>
      )}

      {/* ============================================================
         TOP SERVICES — horizontal bar chart
         ============================================================ */}
      <section className="ana-block">
        <SectionHeader
          eyebrow="Top Performers"
          title="Top Services by Revenue"
          sub={`${topServices.length} services · all time`}
        />
        <div className="ana-card">
          {topServicesChart.length === 0 ? (
            <p className="ana-empty">No service data</p>
          ) : (
            <HbBarChart data={topServicesChart} height={Math.max(160, topServicesChart.length * 44)} />
          )}
        </div>
      </section>

      {/* ============================================================
         TOP SERVICES — table view (with count)
         ============================================================ */}
      <section className="ana-block">
        <SectionHeader
          eyebrow="Details"
          title="Service Breakdown"
          sub="Bookings and revenue per service"
        />
        <div className="ana-table-wrap">
          <table className="ana-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Service Name</th>
                <th className="ana-th--num">Bookings</th>
                <th className="ana-th--num">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topServices.slice(0, 10).map((s, i) => (
                <tr key={i}>
                  <td>
                    <span className="ana-rank">{String(i + 1).padStart(2, '0')}</span>
                  </td>
                  <td className="ana-td-name">{s.name}</td>
                  <td className="ana-td-num">{s.count.toLocaleString('en-US')}</td>
                  <td className="ana-td-num ana-td--bold">{formatPriceFull(s.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topServices.length === 0 && <div className="ana-empty">No service data</div>}
        </div>
      </section>

      {loading && (
        <div className="ana-loading-overlay">
          <div className="ana-spinner" />
        </div>
      )}
      </div>
    </div>
  )
}