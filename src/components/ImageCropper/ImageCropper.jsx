import { useState, useRef, useEffect } from 'react'
import './ImageCropper.css'

export default function ImageCropper({ preview, onConfirm, onCancel, title = 'Cắt ảnh' }) {
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState(null)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const dragStartRef = useRef(null)
  const cropStartRef = useRef(null)
  const imgRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    setIsImageLoaded(false)
    setCropArea({ x: 0, y: 0, size: 100 })
  }, [preview])

  const getNaturalPos = (clientX, clientY) => {
    const img = imgRef.current
    if (!img) return { x: 0, y: 0 }
    const rect = img.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * img.naturalWidth,
      y: ((clientY - rect.top) / rect.height) * img.naturalHeight,
    }
  }

  const getCropStyle = () => {
    const img = imgRef.current
    if (!img) return {}
    const { x, y, size } = cropArea
    const rect = img.getBoundingClientRect()
    return {
      left: (x / img.naturalWidth) * rect.width,
      top: (y / img.naturalHeight) * rect.height,
      width: (size / img.naturalWidth) * rect.width,
      height: (size / img.naturalHeight) * rect.height,
    }
  }

  const getOverlayContainerStyle = () => {
    const img = imgRef.current
    if (!img) return { width: '100%', height: '100%' }
    const rect = img.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  }

  const handleImageLoad = (e) => {
    const img = e.target
    const minDim = Math.min(img.naturalWidth, img.naturalHeight)
    const size = Math.max(100, minDim)
    const x = Math.max(0, (img.naturalWidth - size) / 2)
    const y = Math.max(0, (img.naturalHeight - size) / 2)
    setCropArea({ x, y, size })
    setIsImageLoaded(true)
  }

  const handleOverlayMouseDown = (e) => {
    e.stopPropagation()
    const { x, y } = getNaturalPos(e.clientX, e.clientY)
    dragStartRef.current = { x, y }
    cropStartRef.current = { ...cropArea }
    setDragType('move')
    setIsDragging(true)
  }

  const handleCornerMouseDown = (e, corner) => {
    e.stopPropagation()
    e.preventDefault()
    const { x, y } = getNaturalPos(e.clientX, e.clientY)
    dragStartRef.current = { x, y }
    cropStartRef.current = { ...cropArea }
    setDragType(corner)
    setIsDragging(true)
  }

  const handleOverlayMouseMove = (e) => {
    if (!isDragging || !dragStartRef.current || !cropStartRef.current) return
    const img = imgRef.current
    if (!img) return
    const { x, y } = getNaturalPos(e.clientX, e.clientY)
    const start = dragStartRef.current
    const orig = cropStartRef.current
    const minSize = 40
    const dx = x - start.x
    const dy = y - start.y

    if (dragType === 'move') {
      setCropArea({
        ...orig,
        x: Math.max(0, Math.min(orig.x + dx, img.naturalWidth - orig.size)),
        y: Math.max(0, Math.min(orig.y + dy, img.naturalHeight - orig.size)),
      })
    } else if (dragType === 'br') {
      const newSize = Math.max(minSize, Math.min(orig.size + dx, img.naturalWidth - orig.x, img.naturalHeight - orig.y))
      setCropArea({ ...orig, size: newSize })
    } else if (dragType === 'bl') {
      const newX = Math.max(0, orig.x + dx)
      const newSize = Math.max(minSize, Math.min(orig.size - dx, orig.size + orig.x))
      setCropArea({ x: Math.max(0, orig.x - (orig.size - newSize)), y: orig.y, size: newSize })
    } else if (dragType === 'tr') {
      const newY = Math.max(0, orig.y + dy)
      const newSize = Math.max(minSize, Math.min(orig.size - dy, img.naturalHeight - newY, orig.size + orig.y))
      setCropArea({ x: orig.x, y: newY, size: newSize })
    } else if (dragType === 'tl') {
      const newX = Math.max(0, orig.x + dx)
      const newY = Math.max(0, orig.y + dy)
      const newSize = Math.max(minSize, Math.min(orig.size - dx, orig.size - dy, img.naturalWidth - newX, img.naturalHeight - newY))
      setCropArea({ x: orig.x + orig.size - newSize, y: orig.y + orig.size - newSize, size: newSize })
    }
  }

  const handleOverlayMouseUp = () => {
    setIsDragging(false)
    setDragType(null)
    dragStartRef.current = null
    cropStartRef.current = null
  }

  const getCroppedBlob = () => {
    return new Promise((resolve) => {
      const img = imgRef.current
      if (!img) { resolve(null); return }
      const canvas = document.createElement('canvas')
      const { x, y, size } = cropArea
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, x, y, size, size, 0, 0, size, size)
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
    })
  }

  const handleConfirm = async () => {
    const blob = await getCroppedBlob()
    if (blob) onConfirm(blob)
  }

  const handleCancel = () => {
    if (imgRef.current) imgRef.current.src = ''
    onCancel()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleCancel()
  }

  const s = cropArea.size > 0 ? getCropStyle() : {}

  return (
    <div className="ic-overlay" onClick={handleOverlayClick}>
      <div className="ic-modal">
        <div className="ic-header">
          <h3>{title}</h3>
          <button className="ic-close-btn" onClick={handleCancel}>×</button>
        </div>
        <div className="ic-canvas-wrapper">
          <div className="ic-image-container" ref={containerRef}>
            <img
              ref={imgRef}
              src={preview}
              alt="Crop preview"
              className="ic-image"
              onLoad={handleImageLoad}
              draggable={false}
            />
            {isImageLoaded && (
              <div
                className="ic-overlay-layer"
                style={getOverlayContainerStyle()}
                onMouseMove={handleOverlayMouseMove}
                onMouseUp={handleOverlayMouseUp}
                onMouseLeave={handleOverlayMouseUp}
              >
                <div className="ic-overlay-top" style={{ height: s.top }} />
                <div className="ic-overlay-bottom" style={{ height: `calc(100% - ${s.top + s.height}px)`, top: s.top + s.height }} />
                <div className="ic-overlay-left" style={{ top: s.top, height: s.height, width: s.left }} />
                <div className="ic-overlay-right" style={{ top: s.top, height: s.height, left: s.left + s.width, width: `calc(100% - ${s.left + s.width}px)` }} />
                <div className="ic-grid" style={{ ...s }}>
                  {[...Array(7)].map((_, i) => (
                    <div key={`v${i}`} className="ic-grid-line ic-grid-v" style={{ left: `${((i + 1) / 8) * 100}%` }} />
                  ))}
                  {[...Array(7)].map((_, i) => (
                    <div key={`h${i}`} className="ic-grid-line ic-grid-h" style={{ top: `${((i + 1) / 8) * 100}%` }} />
                  ))}
                </div>
                <div className="ic-border" style={s} onMouseDown={handleOverlayMouseDown} />
                <div className="ic-corner ic-corner-tl" style={{ left: s.left - 7, top: s.top - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'tl')} />
                <div className="ic-corner ic-corner-tr" style={{ left: s.left + s.width - 7, top: s.top - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'tr')} />
                <div className="ic-corner ic-corner-bl" style={{ left: s.left - 7, top: s.top + s.height - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'bl')} />
                <div className="ic-corner ic-corner-br" style={{ left: s.left + s.width - 7, top: s.top + s.height - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'br')} />
              </div>
            )}
          </div>
        </div>
        <div className="ic-footer">
          <button className="ic-btn ic-btn-cancel" onClick={handleCancel}>Hủy</button>
          <button className="ic-btn ic-btn-ok" onClick={handleConfirm}>OK</button>
        </div>
      </div>
    </div>
  )
}
