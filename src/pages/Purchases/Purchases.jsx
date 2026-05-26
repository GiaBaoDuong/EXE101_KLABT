import AppHeader from '../../components/AppHeader/AppHeader'
import './Purchases.css'

export default function Purchases() {
  return (
    <main className="purchases-page">
      <AppHeader
        leftText="About"
        nav={[
          { label: 'Homepage', to: '/' },
          { label: 'Pet Profile', to: '/pet-profile' },
        ]}
        cartCount={0}
      />

      <section className="purchases-content">
        <h2>Purchased items</h2>
        <p className="muted">Trang này hiển thị danh sách các món hàng đã mua.</p>

        <div className="empty-card">
          <strong>Chưa có đơn hàng</strong>
          <p>Hãy mua sắm để danh sách xuất hiện ở đây.</p>
        </div>
      </section>
    </main>
  )
}

