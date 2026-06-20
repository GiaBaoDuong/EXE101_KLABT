import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminDashboard.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const IconPackage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
)

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

function AdminDashboard() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('accounts')
  const getToken = () => token || sessionStorage.getItem('token')

  useEffect(() => {
    if (!token && !sessionStorage.getItem('token')) navigate('/login')
  }, [navigate, token])

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [accounts, setAccounts] = useState([])
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState({ type: null, item: null })
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [accountForm, setAccountForm] = useState({
    email: '', fullName: '', phone: '', role: 'Customer', password: ''
  })

  const [products, setProducts] = useState([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', stockQuantity: '', category: 1, brand: '', weight: '', images: [], previewImages: [], isActive: true
  })
  const productFileRef = useRef(null)

  const [services, setServices] = useState([])
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', duration: '', price: '', category: 1, images: [], previewImages: [], isActive: true
  })
  const serviceFileRef = useRef(null)
  const [pendingServiceBlobs, setPendingServiceBlobs] = useState([])

  const [cropModal, setCropModal] = useState({ open: false, file: null, preview: null })
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState(null)
  const dragStartRef = useRef(null)
  const cropStartRef = useRef(null)
  const cropContainerRef = useRef(null)
  const imgRef = useRef(null)
  const [cropTarget, setCropTarget] = useState(null)

  const [proPrice, setProPrice] = useState('')

  useEffect(() => {
    if (activeTab === 'accounts') fetchAccounts()
    else if (activeTab === 'products') fetchProducts()
    else if (activeTab === 'services') fetchServices()
    else if (activeTab === 'promembership') fetchProMembership()
  }, [activeTab])

  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const fetchAccounts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/accounts`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) setAccounts(await res.json())
    } catch (e) { console.log(e) }
    setIsLoading(false)
  }

  const openAccountModal = (account = null) => {
    if (account) {
      setSelectedAccount(account)
      setAccountForm({
        email: account.email || '',
        fullName: account.fullName || '',
        phone: account.phone || '',
        role: account.role || 'Customer',
        password: ''
      })
    } else {
      setSelectedAccount(null)
      setAccountForm({ email: '', fullName: '', phone: '', role: 'Customer', password: '' })
    }
    setShowAccountModal(true)
  }

  const handleSaveAccount = async (e) => {
    e.preventDefault()
    const isEdit = !!selectedAccount
    const url = isEdit ? `${API_BASE_URL}/api/admin/accounts/${selectedAccount.accountId || selectedAccount.userId}` : `${API_BASE_URL}/api/admin/accounts`
    const method = isEdit ? 'PUT' : 'POST'
    const body = isEdit
      ? { email: accountForm.email, fullName: accountForm.fullName, phone: accountForm.phone, role: accountForm.role }
      : { ...accountForm }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setShowAccountModal(false)
        showSuccess(isEdit ? 'Account updated!' : 'Account created!')
        fetchAccounts()
      }
    } catch (e) { console.log(e) }
  }

  const handleDeleteAccount = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/accounts/${selectedAccount.accountId || selectedAccount.userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      setShowDeleteModal(false)
      showSuccess('Account deleted!')
      fetchAccounts()
    } catch (e) { console.log(e) }
  }

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) setProducts(await res.json())
    } catch (e) { console.log(e) }
    setIsLoading(false)
  }

  const openProductModal = (product = null) => {
    if (product) {
      setSelectedProduct(product)
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stockQuantity: product.stockQuantity?.toString() || '',
        category: product.category || 1,
        brand: product.brand || '',
        weight: product.weight?.toString() || '',
        images: product.images || [],
        previewImages: product.images || [],
        isActive: product.isActive ?? true
      })
    } else {
      setSelectedProduct(null)
      setProductForm({ name: '', description: '', price: '', stockQuantity: '', category: 1, brand: '', weight: '', images: [], previewImages: [], isActive: true })
    }
    setShowProductModal(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    const isEdit = !!selectedProduct
    const url = isEdit ? `${API_BASE_URL}/api/admin/products/${selectedProduct.productId}` : `${API_BASE_URL}/api/admin/products`
    const method = isEdit ? 'PUT' : 'POST'
    const body = {
      productId: selectedProduct?.productId || 0,
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price) || 0,
      stockQuantity: parseInt(productForm.stockQuantity) || 0,
      category: parseInt(productForm.category) || 1,
      brand: productForm.brand,
      weight: parseFloat(productForm.weight) || 0,
      thumbnailUrl: productForm.images[0] || '',
      isActive: productForm.isActive,
      createdAt: selectedProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setShowProductModal(false)
        showSuccess(isEdit ? 'Product updated!' : 'Product created!')
        fetchProducts()
      }
    } catch (e) { console.log(e) }
  }

  const handleDeleteProduct = async (product) => {
    setDeleteTarget({ type: 'product', item: product })
    setShowDeleteModal(true)
  }

  const handleProductImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setCropModal({ open: true, file, preview: event.target?.result })
      setCropTarget('product')
    }
    reader.readAsDataURL(file)
    if (productFileRef.current) productFileRef.current.value = ''
  }

  const getCroppedBlob = () => {
    const img = imgRef.current
    if (!img) return null
    const { x, y, size } = cropArea
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, x, y, size, size, 0, 0, size, size)
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
    })
  }

  const handleCropConfirm = async () => {
    const blob = await getCroppedBlob()
    if (!blob) return
    const previewUrl = URL.createObjectURL(blob)
    const target = cropTarget

    if (target === 'service') {
      setServiceForm(prev => ({ ...prev, previewImages: [...prev.previewImages, previewUrl] }))
      setPendingServiceBlobs(prev => [...prev, blob])
    } else {
      setProductForm(prev => ({ ...prev, previewImages: [...prev.previewImages, previewUrl] }))
      const formData = new FormData()
      formData.append('file', blob, 'product.jpg')
      fetch(`${API_BASE_URL}/api/uploads/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      }).then(res => res.json()).then(data => {
        setProductForm(prev => ({ ...prev, images: [...prev.images, data.url || data.imageUrl || data] }))
      }).catch(err => console.error('[Product] Upload error:', err))
    }
    setCropModal({ open: false, file: null, preview: null })
  }

  const handleCropCancel = () => {
    if (imgRef.current) imgRef.current.src = ''
    setCropModal({ open: false, file: null, preview: null })
    setCropArea({ x: 0, y: 0, size: 100 })
  }

  const handleImageLoad = (e) => {
    const img = e.target
    const naturalW = img.naturalWidth
    const naturalH = img.naturalHeight
    const size = Math.min(naturalW, naturalH) * 0.6
    const cx = (naturalW - size) / 2
    const cy = (naturalH - size) / 2
    setCropArea({ x: cx, y: cy, size })
  }

  const getNaturalPos = (clientX, clientY) => {
    const img = imgRef.current
    if (!img) return { x: 0, y: 0 }
    const rect = img.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (img.naturalWidth / rect.width),
      y: (clientY - rect.top) * (img.naturalHeight / rect.height),
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

  const removeProductImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      previewImages: prev.previewImages.filter((_, i) => i !== index)
    }))
  }

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/services`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) setServices(await res.json())
    } catch (e) { console.log(e) }
    setIsLoading(false)
  }

  const handleServiceImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setCropModal({ open: true, file, preview: event.target?.result })
      setCropTarget('service')
    }
    reader.readAsDataURL(file)
    if (serviceFileRef.current) serviceFileRef.current.value = ''
  }

  const removeServiceImage = (index) => {
    setServiceForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      previewImages: prev.previewImages.filter((_, i) => i !== index)
    }))
  }

  const openServiceModal = (service = null) => {
    if (service) {
      setSelectedService(service)
      setServiceForm({
        name: service.name || '',
        description: service.description || '',
        duration: service.durationMinutes?.toString() || service.duration?.toString().replace(/[^0-9]/g, '') || '',
        price: service.price?.toString() || '',
        category: service.category ?? 1,
        images: service.images || [],
        previewImages: service.images || [],
        isActive: service.isActive ?? true
      })
    } else {
      setSelectedService(null)
      setServiceForm({ name: '', description: '', duration: '', price: '', category: 1, images: [], previewImages: [], isActive: true })
      setPendingServiceBlobs([])
    }
    setShowServiceModal(true)
  }

  const handleSaveService = async (e) => {
    e.preventDefault()
    const isEdit = !!selectedService
    const url = isEdit ? `${API_BASE_URL}/api/admin/services/${selectedService.serviceId}` : `${API_BASE_URL}/api/admin/services`
    const method = isEdit ? 'PUT' : 'POST'

    let uploadedUrls = [...serviceForm.images]
    if (pendingServiceBlobs.length > 0) {
      for (const blob of pendingServiceBlobs) {
        const formData = new FormData()
        formData.append('file', blob, 'service.jpg')
        try {
          const res = await fetch(`${API_BASE_URL}/api/uploads/image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
            body: formData,
          })
          const data = await res.json()
          uploadedUrls.push(data.url || data.imageUrl || data)
        } catch (err) { console.error('[Service] Upload error:', err) }
      }
      setPendingServiceBlobs([])
    }

    const body = {
      serviceId: selectedService?.serviceId || 0,
      name: serviceForm.name,
      description: serviceForm.description,
      durationMinutes: parseInt(serviceForm.duration) || 0,
      price: parseFloat(serviceForm.price) || 0,
      category: parseInt(serviceForm.category) || 1,
      thumbnailUrl: uploadedUrls[0] || '',
      isActive: serviceForm.isActive,
      createdAt: selectedService?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setShowServiceModal(false)
        showSuccess(isEdit ? 'Service updated!' : 'Service created!')
        fetchServices()
      }
    } catch (e) { console.log(e) }
  }

  const handleDeleteService = async (service) => {
    setDeleteTarget({ type: 'service', item: service })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    const { type, item } = deleteTarget
    try {
      if (type === 'account') {
        await fetch(`${API_BASE_URL}/api/admin/accounts/${item.accountId || item.userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        })
        showSuccess('Account deleted!')
        fetchAccounts()
      } else if (type === 'product') {
        await fetch(`${API_BASE_URL}/api/admin/products/${item.productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        })
        showSuccess('Product deleted!')
        fetchProducts()
      } else if (type === 'service') {
        await fetch(`${API_BASE_URL}/api/admin/services/${item.serviceId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
        })
        showSuccess('Service deleted!')
        fetchServices()
      }
    } catch (e) { console.log(e) }
    setShowDeleteModal(false)
    setDeleteTarget({ type: null, item: null })
  }

  const getDeleteMessage = () => {
    const { type, item } = deleteTarget
    if (type === 'account') return item?.fullName || item?.email
    if (type === 'product') return item?.name
    if (type === 'service') return item?.name
    return ''
  }

  const getDeleteTitle = () => {
    const { type } = deleteTarget
    if (type === 'account') return 'Delete Account'
    if (type === 'product') return 'Delete Product'
    if (type === 'service') return 'Delete Service'
    return 'Confirm Delete'
  }

  const fetchProMembership = () => { setProPrice('99000') }

  const handleUpdateProPrice = async (e) => {
    e.preventDefault()
    showSuccess('Pro price updated!')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('justLoggedIn')
    navigate('/login')
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  }

  const getRoleClass = (role) => {
    const map = { 'Admin': 'admin', 'Staff': 'staff', 'Doctor': 'doctor', 'Customer': 'customer' }
    const key = typeof role === 'number'
      ? (role === 1 ? 'Admin' : role === 2 ? 'Staff' : role === 3 ? 'Doctor' : 'Customer')
      : role
    return map[key] || 'customer'
  }

  return (
    <>
      {/* Crop Modal */}
      {cropModal.open && (
        <div className="adm-crop-overlay" onClick={(e) => e.target === e.currentTarget && handleCropCancel()}>
          <div className="adm-crop">
            <div className="adm-crop__header">
              <h3>{cropTarget === 'service' ? 'Crop Service Image' : 'Crop Product Image'}</h3>
              <button className="adm-crop__close" onClick={handleCropCancel}>×</button>
            </div>
            <div className="adm-crop__canvas">
              <div className="adm-crop__container" ref={cropContainerRef}>
                <img ref={imgRef} src={cropModal.preview} alt="Crop preview" className="adm-crop__img" onLoad={handleImageLoad} draggable={false} />
                {cropArea.size > 0 && (() => {
                  const s = getCropStyle()
                  return (
                    <div className="adm-crop__overlay"
                      style={getOverlayContainerStyle()}
                      onMouseMove={handleOverlayMouseMove}
                      onMouseUp={handleOverlayMouseUp}
                      onMouseLeave={handleOverlayMouseUp}
                    >
                      <div className="adm-crop__shade-t" style={{ height: s.top }} />
                      <div className="adm-crop__shade-b" style={{ height: `calc(100% - ${s.top + s.height}px)`, top: s.top + s.height }} />
                      <div className="adm-crop__shade-l" style={{ top: s.top, height: s.height, width: s.left }} />
                      <div className="adm-crop__shade-r" style={{ top: s.top, height: s.height, left: s.left + s.width, width: `calc(100% - ${s.left + s.width}px)` }} />
                      <div className="adm-crop__grid" style={{ ...s }}>
                        {[...Array(7)].map((_, i) => (
                          <div key={`v${i}`} className="adm-crop__grid-line adm-crop__grid-line--v" style={{ left: `${((i + 1) / 8) * 100}%` }} />
                        ))}
                        {[...Array(7)].map((_, i) => (
                          <div key={`h${i}`} className="adm-crop__grid-line adm-crop__grid-line--h" style={{ top: `${((i + 1) / 8) * 100}%` }} />
                        ))}
                      </div>
                      <div className="adm-crop__border" style={s} onMouseDown={handleOverlayMouseDown} />
                      <div className="adm-crop__corner adm-crop__corner--tl" style={{ left: s.left - 7, top: s.top - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'tl')} />
                      <div className="adm-crop__corner adm-crop__corner--tr" style={{ left: s.left + s.width - 7, top: s.top - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'tr')} />
                      <div className="adm-crop__corner adm-crop__corner--bl" style={{ left: s.left - 7, top: s.top + s.height - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'bl')} />
                      <div className="adm-crop__corner adm-crop__corner--br" style={{ left: s.left + s.width - 7, top: s.top + s.height - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'br')} />
                    </div>
                  )
                })()}
              </div>
            </div>
            <div className="adm-crop__footer">
              <button className="adm-crop__btn adm-crop__btn--cancel" onClick={handleCropCancel}>Cancel</button>
              <button className="adm-crop__btn adm-crop__btn--ok" onClick={handleCropConfirm}>OK</button>
            </div>
          </div>
        </div>
      )}

      <div className="adm">
        {/* Header */}
        <div className="adm-header">
          <div className="adm-header__left">
            <Link to="/home" className="adm-header__back"><IconArrowLeft /> Back to home</Link>
          </div>
          <div className="adm-header__center">
            <h1 className="adm-header__title">Admin Dashboard</h1>
          </div>
          <div className="adm-header__right" />
        </div>

        {successMessage && (
          <div className="adm-success">
            <IconCheck /> {successMessage}
          </div>
        )}

        <div className="adm-layout">
          {/* Sidebar */}
          <aside className="adm-sidebar">
            <nav className="adm-sidebar__nav">
              <button className={`adm-sidebar__btn ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
                <IconUsers /> <span>Accounts</span>
              </button>
              <button className={`adm-sidebar__btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                <IconPackage /> <span>Products</span>
              </button>
              <button className={`adm-sidebar__btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
                <IconSettings /> <span>Services</span>
              </button>
              <button className={`adm-sidebar__btn ${activeTab === 'promembership' ? 'active' : ''}`} onClick={() => setActiveTab('promembership')}>
                <IconStar /> <span>Pro Membership</span>
              </button>
            </nav>
            <div className="adm-sidebar__footer">
              <button className="adm-sidebar__logout" onClick={handleLogout}>
                <IconLogout /> <span>Log out</span>
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="adm-content">

            {/* ACCOUNTS */}
            {activeTab === 'accounts' && (
              <div className="adm-panel">
                <div className="adm-panel__header">
                  <h2>Account Management</h2>
                  <button className="adm-add-btn" onClick={() => openAccountModal()}>
                    <IconPlus /> Add Account
                  </button>
                </div>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map(account => (
                        <tr key={account.userId || account.accountId}>
                          <td>{account.userId || account.accountId}</td>
                          <td>{account.fullName || account.username}</td>
                          <td>{account.email || account.username}</td>
                          <td>{account.phone || '—'}</td>
                          <td>
                            <span className={`adm-role-badge adm-role-badge--${getRoleClass(account.role)}`}>
                              {account.role === 1 ? 'Admin' : account.role === 2 ? 'Staff' : account.role === 3 ? 'Doctor' : 'Customer'}
                            </span>
                          </td>
                          <td>
                            <div className="adm-actions">
                              <button className="adm-action-btn adm-action-btn--edit" onClick={() => openAccountModal(account)}><IconEdit /></button>
                              <button className="adm-action-btn adm-action-btn--delete" onClick={() => { setSelectedAccount(account); setShowDeleteModal(true); }}><IconTrash /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {accounts.length === 0 && <div className="adm-empty">No accounts found</div>}
                </div>
              </div>
            )}

            {/* PRODUCTS */}
            {activeTab === 'products' && (
              <div className="adm-panel">
                <div className="adm-panel__header">
                  <h2>Product Management</h2>
                  <button className="adm-add-btn" onClick={() => openProductModal()}>
                    <IconPlus /> Add Product
                  </button>
                </div>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th style={{width: '64px'}}>Image</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.productId}>
                          <td>
                            {(product.thumbnailUrl || product.images?.[0]) ? (
                              <img src={product.thumbnailUrl || product.images[0]} alt={product.name} className="adm-thumb" />
                            ) : (
                              <div className="adm-thumb-placeholder"><IconPackage /></div>
                            )}
                          </td>
                          <td>
                            <div className="adm-cell-name">
                              <span className="adm-cell-name__title">{product.name}</span>
                              <span className="adm-cell-name__sub">{product.brand || '—'}</span>
                            </div>
                          </td>
                          <td><span className="adm-price">{formatPrice(product.price)}</span></td>
                          <td>{product.stockQuantity}</td>
                          <td>
                            <div className="adm-actions">
                              <button className="adm-action-btn adm-action-btn--edit" onClick={() => openProductModal(product)}><IconEdit /></button>
                              <button className="adm-action-btn adm-action-btn--delete" onClick={() => handleDeleteProduct(product)}><IconTrash /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length === 0 && <div className="adm-empty">No products found</div>}
                </div>
              </div>
            )}

            {/* SERVICES */}
            {activeTab === 'services' && (
              <div className="adm-panel">
                <div className="adm-panel__header">
                  <h2>Service Management</h2>
                  <button className="adm-add-btn" onClick={() => openServiceModal()}>
                    <IconPlus /> Add Service
                  </button>
                </div>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th style={{width: '64px'}}>Image</th>
                        <th>Service Name</th>
                        <th>Duration</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(service => (
                        <tr key={service.serviceId}>
                          <td>
                            {(service.thumbnailUrl || service.images?.[0]) ? (
                              <img src={service.thumbnailUrl || service.images[0]} alt={service.name} className="adm-thumb" />
                            ) : (
                              <div className="adm-thumb-placeholder"><IconSettings /></div>
                            )}
                          </td>
                          <td>
                            <div className="adm-cell-name">
                              <span className="adm-cell-name__title">{service.name}</span>
                            </div>
                          </td>
                          <td>{service.durationMinutes ?? service.duration ?? '—'} min</td>
                          <td><span className="adm-price">{formatPrice(service.price)}</span></td>
                          <td>
                            <div className="adm-actions">
                              <button className="adm-action-btn adm-action-btn--edit" onClick={() => openServiceModal(service)}><IconEdit /></button>
                              <button className="adm-action-btn adm-action-btn--delete" onClick={() => handleDeleteService(service)}><IconTrash /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {services.length === 0 && <div className="adm-empty">No services found</div>}
                </div>
              </div>
            )}

            {/* PRO MEMBERSHIP */}
            {activeTab === 'promembership' && (
              <div className="adm-panel">
                <div className="adm-panel__header">
                  <h2>Pro Membership</h2>
                </div>
                <div className="adm-pro-card">
                  <div className="adm-pro-card__icon">
                    <IconStar />
                  </div>
                  <h3>Pro Membership Plan</h3>
                  <p>Set the monthly subscription price for Pro Membership</p>
                  <form className="adm-pro-form" onSubmit={handleUpdateProPrice}>
                    <div>
                      <label>Pro Price (VND)</label>
                      <input type="number" value={proPrice} onChange={(e) => setProPrice(e.target.value)} placeholder="e.g. 99000" required />
                    </div>
                    <button type="submit" className="adm-pro-update-btn">Update Price</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal__header">
              <h3>{selectedAccount ? 'Update Account' : 'Create Account'}</h3>
              <button className="adm-modal__close" onClick={() => setShowAccountModal(false)}><IconX /></button>
            </div>
            <div className="adm-modal__body">
              <form onSubmit={handleSaveAccount}>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label>Name</label>
                    <input type="text" value={accountForm.fullName} onChange={e => setAccountForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Enter name" required />
                  </div>
                  <div className="adm-form-group">
                    <label>Email</label>
                    <input type="email" value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} placeholder="Enter email" required />
                  </div>
                </div>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label>Phone</label>
                    <input type="tel" value={accountForm.phone} onChange={e => setAccountForm(p => ({ ...p, phone: e.target.value }))} placeholder="Enter phone" />
                  </div>
                  <div className="adm-form-group">
                    <label>Role</label>
                    <select value={accountForm.role} onChange={e => setAccountForm(p => ({ ...p, role: e.target.value }))}>
                      <option value="Customer">Customer</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Staff">Staff</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                {!selectedAccount && (
                  <div className="adm-form-group">
                    <label>Password</label>
                    <input type="password" value={accountForm.password} onChange={e => setAccountForm(p => ({ ...p, password: e.target.value }))} placeholder="Enter password" required />
                  </div>
                )}
                <div className="adm-modal-actions">
                  <button type="button" className="adm-btn adm-btn--cancel" onClick={() => setShowAccountModal(false)}>Cancel</button>
                  <button type="submit" className="adm-btn adm-btn--submit">{selectedAccount ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="adm-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="adm-delete-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-delete-icon">
              <IconTrash />
            </div>
            <h3>{getDeleteTitle()}</h3>
            <p>Are you sure you want to delete <strong>"{getDeleteMessage()}"</strong>?</p>
            <div className="adm-delete-actions">
              <button className="adm-btn adm-btn--cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="adm-btn adm-btn--delete" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="adm-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="adm-modal adm-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="adm-modal__header">
              <h3>{selectedProduct ? 'Update Product' : 'Create Product'}</h3>
              <button className="adm-modal__close" onClick={() => setShowProductModal(false)}><IconX /></button>
            </div>
            <div className="adm-modal__body">
              <form onSubmit={handleSaveProduct}>
                {/* Image Upload */}
                <div className="adm-upload-section">
                  <label>Product Images</label>
                  <div className="adm-upload-grid">
                    {productForm.previewImages.map((img, index) => (
                      <div key={index} className="adm-upload-item">
                        <img src={img} alt={`Image ${index + 1}`} />
                        <button type="button" className="adm-upload-remove" onClick={() => removeProductImage(index)}>×</button>
                      </div>
                    ))}
                    <div className="adm-upload-add" onClick={() => productFileRef.current?.click()}>
                      <span>+</span>
                      <span>Add</span>
                    </div>
                  </div>
                  <input type="file" ref={productFileRef} onChange={handleProductImageChange} accept="image/*" style={{ display: 'none' }} />
                </div>

                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label>Product Name *</label>
                    <input type="text" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Dog Food" required />
                  </div>
                  <div className="adm-form-group">
                    <label>Brand</label>
                    <input type="text" value={productForm.brand} onChange={e => setProductForm(p => ({ ...p, brand: e.target.value }))} placeholder="e.g. Pedigree" />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label>Description</label>
                  <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Enter description" rows={3} />
                </div>

                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label>Price (VND) *</label>
                    <input type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 150000" required />
                  </div>
                  <div className="adm-form-group">
                    <label>Stock *</label>
                    <input type="number" value={productForm.stockQuantity} onChange={e => setProductForm(p => ({ ...p, stockQuantity: e.target.value }))} placeholder="e.g. 100" required />
                  </div>
                </div>

                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label>Category</label>
                    <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: parseInt(e.target.value) }))}>
                      <option value={1}>Food</option>
                      <option value={2}>Toys</option>
                      <option value={3}>Grooming</option>
                      <option value={4}>Health</option>
                      <option value={5}>Accessories</option>
                    </select>
                  </div>
                  <div className="adm-form-group">
                    <label>Weight (kg)</label>
                    <input type="number" value={productForm.weight} onChange={e => setProductForm(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 1.5" step="0.1" />
                  </div>
                </div>

                <div className="adm-checkbox">
                  <input type="checkbox" id="isActiveProd" checked={productForm.isActive} onChange={e => setProductForm(p => ({ ...p, isActive: e.target.checked }))} />
                  <label htmlFor="isActiveProd">Active</label>
                </div>

                <div className="adm-modal-actions">
                  <button type="button" className="adm-btn adm-btn--cancel" onClick={() => setShowProductModal(false)}>Cancel</button>
                  <button type="submit" className="adm-btn adm-btn--submit">{selectedProduct ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="adm-modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal__header">
              <h3>{selectedService ? 'Update Service' : 'Create Service'}</h3>
              <button className="adm-modal__close" onClick={() => setShowServiceModal(false)}><IconX /></button>
            </div>
            <div className="adm-modal__body">
              <form onSubmit={handleSaveService}>
                {/* Image Upload */}
                <div className="adm-upload-section">
                  <label>Service Images</label>
                  <div className="adm-upload-grid">
                    {serviceForm.previewImages.map((img, index) => (
                      <div key={index} className="adm-upload-item">
                        <img src={img} alt={`Image ${index + 1}`} />
                        <button type="button" className="adm-upload-remove" onClick={() => removeServiceImage(index)}>×</button>
                      </div>
                    ))}
                    <div className="adm-upload-add" onClick={() => serviceFileRef.current?.click()}>
                      <span>+</span>
                      <span>Add</span>
                    </div>
                  </div>
                  <input type="file" ref={serviceFileRef} onChange={handleServiceImageChange} accept="image/*" style={{ display: 'none' }} />
                </div>

                <div className="adm-form-group">
                  <label>Service Name *</label>
                  <input type="text" value={serviceForm.name} onChange={e => setServiceForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Grooming, Vet Checkup" required />
                </div>

                <div className="adm-form-group">
                  <label>Description</label>
                  <textarea value={serviceForm.description} onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))} placeholder="Enter description" rows={3} />
                </div>

                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label>Duration (min) *</label>
                    <input type="number" value={serviceForm.duration} onChange={e => setServiceForm(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 60" required />
                  </div>
                  <div className="adm-form-group">
                    <label>Price (VND) *</label>
                    <input type="number" value={serviceForm.price} onChange={e => setServiceForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 200000" required />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label>Category *</label>
                  <select
                    value={serviceForm.category}
                    onChange={e => setServiceForm(p => ({ ...p, category: parseInt(e.target.value) }))}
                    required
                  >
                    <option value={1}>Grooming</option>
                    <option value={2}>Health</option>
                    <option value={3}>Spa</option>
                  </select>
                </div>

                <div className="adm-checkbox">
                  <input type="checkbox" id="isActiveSvc" checked={serviceForm.isActive} onChange={e => setServiceForm(p => ({ ...p, isActive: e.target.checked }))} />
                  <label htmlFor="isActiveSvc">Active</label>
                </div>

                <div className="adm-modal-actions">
                  <button type="button" className="adm-btn adm-btn--cancel" onClick={() => setShowServiceModal(false)}>Cancel</button>
                  <button type="submit" className="adm-btn adm-btn--submit">{selectedService ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminDashboard
