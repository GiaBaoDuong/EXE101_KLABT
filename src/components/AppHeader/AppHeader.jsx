import { Link, useLocation } from 'react-router-dom'
import './AppHeader.css'

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M10.5 3a7.5 7.5 0 1 1 4.74 13.32l4.22 4.23-1.42 1.41-4.23-4.22A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0-2a2.5 2.5 0 1 1 2.5-2.5A2.5 2.5 0 0 1 12 10Z"
        fill="currentColor"
      />
      <path
        d="M4 21a8 8 0 0 1 16 0h-2a6 6 0 0 0-12 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M7 8V7a5 5 0 0 1 10 0v1h3l-1 13H5L4 8h3Zm2 0h6V7a3 3 0 0 0-6 0v1Zm-2.82 2l.77 9h10.1l.77-9H6.18Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function AppHeader({
  leftText = 'About',
  nav = [],
  promoText,
  cartCount = 0,
}) {
  const location = useLocation()

  return (
    <header className="app-header">
      <div className="app-header-top">
        <span className="app-header-left">{leftText}</span>

        <Link to="/" className="app-logo" aria-label="Go to homepage">
          K-LABT
        </Link>

        <div className="app-actions">
          <button type="button" className="icon-btn" aria-label="Search">
            <IconSearch className="icon" />
          </button>
          <button type="button" className="icon-btn" aria-label="User">
            <IconUser className="icon" />
          </button>
          <Link to="/purchases" className="icon-btn icon-link" aria-label="Purchased items">
            <IconBag className="icon" />
            <span className="badge" aria-label={`Cart count ${cartCount}`}>
              {cartCount}
            </span>
          </Link>
        </div>
      </div>

      {nav?.length ? (
        <nav className="app-nav" aria-label="Primary">
          {nav.map((item) => {
            const isActive = item.to && location.pathname === item.to
            const className = isActive ? 'active' : undefined

            if (item.to) {
              return (
                <Link key={item.label} to={item.to} className={className}>
                  {item.label}
                </Link>
              )
            }

            return (
              <a key={item.label} href={item.href ?? '#'} className={className}>
                {item.label}
              </a>
            )
          })}
        </nav>
      ) : null}

      {promoText ? <div className="app-promo">{promoText}</div> : null}
    </header>
  )
}

