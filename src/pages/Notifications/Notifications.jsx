import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import './Notifications.css'

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  )
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  )
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
      <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
  )
}

const getNotifIcon = (type) => {
  switch (type) {
    case 'booking_pending': return <IconCalendar />
    case 'booking_confirmed': return <IconCheck />
    case 'booking_rejected': return <IconX />
    default: return <IconBell />
  }
}

const getNotifColor = (type) => {
  switch (type) {
    case 'booking_pending': return '#f59e0b'
    case 'booking_confirmed': return '#22c55e'
    case 'booking_rejected': return '#ef4444'
    default: return '#667eea'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatRelative(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} ngày trước`
  return formatDate(dateStr)
}

export default function Notifications() {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount } = useNotification()
  const [filter, setFilter] = useState('all') // all | unread

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <div className="notif-page">
      <div className="notif-page-container">
        <div className="notif-page-header">
          <div className="notif-page-title-row">
            <button className="notif-page-back" onClick={() => navigate(-1)}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <h1>Thông báo</h1>
          </div>
          <div className="notif-page-actions">
            <div className="notif-filter-tabs">
              <button
                className={`notif-filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                className={`notif-filter-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button className="notif-page-action-btn" onClick={markAllAsRead}>
                Đánh dấu đã đọc
              </button>
            )}
            {notifications.length > 0 && (
              <button className="notif-page-action-btn danger" onClick={clearNotifications}>
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        <div className="notif-page-list">
          {filtered.length === 0 ? (
            <div className="notif-page-empty">
              <div className="notif-page-empty-icon">
                <IconBell />
              </div>
              <p className="notif-page-empty-title">
                {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
              </p>
              <p className="notif-page-empty-sub">
                {filter === 'unread'
                  ? 'Tất cả thông báo đã được đọc'
                  : 'Thông báo sẽ xuất hiện khi có cập nhật về lịch hẹn của bạn'}
              </p>
            </div>
          ) : (
            filtered.map(notif => (
              <div
                key={notif.id}
                className={`notif-page-item ${notif.read ? 'read' : 'unread'}`}
                onClick={() => {
                  markAsRead(notif.id)
                  if (notif.link) navigate(notif.link)
                }}
              >
                <div
                  className="notif-page-item-icon"
                  style={{ background: `${getNotifColor(notif.type)}20`, color: getNotifColor(notif.type) }}
                >
                  {getNotifIcon(notif.type)}
                </div>
                <div className="notif-page-item-content">
                  <div className="notif-page-item-header">
                    <p className="notif-page-item-title">{notif.title}</p>
                    {!notif.read && <span className="notif-page-dot"></span>}
                  </div>
                  <p className="notif-page-item-body">{notif.message}</p>
                  <span className="notif-page-item-time">{formatRelative(notif.timestamp)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
