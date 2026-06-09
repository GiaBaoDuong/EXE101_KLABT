import SharedNav from '../../components/SharedNav/SharedNav'
import './Purchases.css'

export default function Purchases() {
  return (
    <main className="purchases-page">
      <SharedNav cartCount={0} />

      <section className="purchases-content">
        <h2>Purchased items</h2>
        <p className="muted">This page displays your purchased items.</p>

        <div className="empty-card">
          <strong>No orders yet</strong>
          <p>Start shopping to see your orders here.</p>
        </div>
      </section>
    </main>
  )
}
