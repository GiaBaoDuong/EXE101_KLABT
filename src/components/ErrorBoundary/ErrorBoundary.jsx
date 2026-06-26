import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log to console for debugging; can be extended to send to Sentry/LogRocket
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided by parent
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>!</div>
            <h1 style={styles.title}>Đã xảy ra lỗi</h1>
            <p style={styles.message}>
              Ứng dụng gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
            </p>
            {this.state.error?.message && (
              <details style={styles.details}>
                <summary style={styles.summary}>Chi tiết lỗi</summary>
                <code style={styles.code}>{this.state.error.message}</code>
              </details>
            )}
            <div style={styles.actions}>
              <button onClick={this.handleReload} style={styles.primaryButton}>
                Tải lại trang
              </button>
              <button onClick={this.handleGoHome} style={styles.secondaryButton}>
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    background: '#fff',
    borderRadius: '12px',
    padding: '40px 32px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
  },
  icon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#fee',
    color: '#c33',
    fontSize: '32px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 12px',
  },
  message: {
    fontSize: '15px',
    color: '#666',
    lineHeight: 1.5,
    margin: '0 0 24px',
  },
  details: {
    textAlign: 'left',
    margin: '16px 0',
    padding: '12px',
    background: '#f7f7f8',
    borderRadius: '6px',
    fontSize: '13px',
  },
  summary: {
    cursor: 'pointer',
    color: '#666',
    fontWeight: '500',
  },
  code: {
    display: 'block',
    marginTop: '8px',
    color: '#c33',
    wordBreak: 'break-word',
    fontSize: '12px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '10px 24px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  secondaryButton: {
    padding: '10px 24px',
    background: '#fff',
    color: '#4f46e5',
    border: '1px solid #4f46e5',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}

export default ErrorBoundary
