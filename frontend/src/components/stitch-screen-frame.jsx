import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { API_BASE_URL, fetchProducts, fetchBlogs, fetchProduct } from '../api'
import { useCart } from '../context/cartContext'
import { useGoogleLogin } from '@react-oauth/google'

const STORAGE_KEYS = {
  CART: 'pett_stitch_cart_v2',
  ORDER: 'pett_stitch_order_v1',
}

const BRAND_COLORS = {
  PRIMARY: '#14b8a6',
  BACKGROUND: '#fbfaee',
}

const normalizeString = (value) => 
  value
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim() || ''

export default function StitchScreenFrame({ html, title, fitContent = true }) {
  const iframeRef = useRef(null)
  const productsRef = useRef([])
  const { user, loginWithGoogle, refreshUser } = useAuth()
  const { addToCart, cart, clearCart, getTotalItems, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const { id: urlProductId } = useParams()
  
  const getViewportHeight = () => {
    if (typeof window === 'undefined') return 900
    return Math.max(window.innerHeight || document.documentElement?.clientHeight || 0, 1)
  }
  const [height, setHeight] = useState(getViewportHeight)
  
  const [filters, setFilters] = useState({
    category: 'all',
    petType: 'dog,cat',
    search: '',
    sort: 'popular'
  })

  useEffect(() => {
    const handleGlobalMessage = (event) => {
      if (event.data.type === 'PETT_SUBSCRIPTION_COMPLETED') {
        const formData = event.data.data
        const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]')
        const subItem = items.find(i => i.category === 'subscription')
        
        if (subItem) {
          // Sync with backend to update user tier
          const token = localStorage.getItem('pett_token')
          if (token) {
            fetch(`${API_BASE_URL}/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                items: [{
                  id: subItem.id,
                  name: subItem.name,
                  price: Number(subItem.price),
                  quantity: 1,
                  images: subItem.images || []
                }],
                total_amount: Number(subItem.price),
                payment_method: 'momo',
                shipping_address: formData.address || 'Đăng ký gói',
                customer_phone: formData.phone || 'N/A'
              })
            }).then(() => refreshUser())
          }

          const activeSubs = JSON.parse(localStorage.getItem('pett_active_subscriptions') || '[]')
          const orderCode = `SUB-${Date.now().toString().slice(-6)}`
          activeSubs.push({
            ...subItem,
            uniqueKey: `${subItem.id}_${orderCode}`,
            orderCode,
            startDate: new Date().toLocaleDateString('vi-VN'),
            status: 'active',
            deliveryInfo: formData
          })
          localStorage.setItem('pett_active_subscriptions', JSON.stringify(activeSubs))
          clearCart()
        }
      }

      if (event.data.type === 'PETT_SUCCESS_CLOSE') {
        navigate('/profile')
      }

      if (event.data.type === 'PETT_CHECKOUT_READY') {
        const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]')
        const subItem = items.find(i => i.category === 'subscription')
        if (subItem && iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'PETT_HYDRATE_SUBSCRIPTION', item: subItem }, '*')
        }
      }
    }

    window.addEventListener('message', handleGlobalMessage)
    return () => window.removeEventListener('message', handleGlobalMessage)
  }, [navigate, clearCart, refreshUser])

  const formatVnd = (value) => `${Math.max(0, Math.round(value)).toLocaleString('vi-VN')}đ`


  const makeOrderCode = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const tail = String(now.getTime()).slice(-4)
    return `PETT-${y}${m}${d}-${tail}`
  }

  const buildOrderSnapshot = (checkoutDoc) => {
    // Force load the absolute latest cart from localStorage to avoid stale React state in closures
    let latestCart = []
    try {
      latestCart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]')
    } catch (e) {
      latestCart = cart
    }

    const items = latestCart
      .map((item) => {
        const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1
        const unitPrice = Number(item.price) > 0 ? Number(item.price) : 0
        return {
          id: item.id,
          name: item.name || 'Sản phẩm',
          description: item.description || '',
          image: item.image || '/images/pett-bag.webp',
          quantity,
          unitPrice,
          lineTotal: unitPrice * quantity,
        }
      })
      .filter((item) => item.quantity > 0)

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
    
    // Apply VIP/PRO discount
    let discountPercent = 0
    if (user?.subscription_tier === 'vip') discountPercent = 0.10
    else if (user?.subscription_tier === 'pro') discountPercent = 0.05
    
    const discount = Math.round(subtotal * discountPercent)
    
    const shipping = subtotal >= 500000 || subtotal === 0 ? 0 : 30000
    const total = subtotal + shipping - discount

    const getValueById = (id) => {
      const value = checkoutDoc?.getElementById(id)?.value
      return typeof value === 'string' ? value.trim() : ''
    }

    const getSelectedLabelById = (id) => {
      const field = checkoutDoc?.getElementById(id)
      const index = field?.selectedIndex
      if (typeof index !== 'number' || index < 0) return ''
      return field?.options?.[index]?.text?.trim() || ''
    }

    const deliveryName = getValueById('checkout-contact-name')
    const deliveryPhone = getValueById('checkout-contact-phone')
    const addressLine = getValueById('checkout-address-line')
    const districtLabel = getSelectedLabelById('checkout-address-district')
    const cityLabel = getSelectedLabelById('checkout-address-city')
    const deliveryAddress = [addressLine, districtLabel, cityLabel].filter(Boolean).join(', ')

    const cardOption = checkoutDoc?.getElementById('checkout-payment-card')
    const paymentLabel = cardOption?.checked
      ? 'Thanh toán qua ví MoMo'
      : 'Thanh toán khi nhận hàng (COD)'

    return {
      orderCode: makeOrderCode(),
      createdAt: new Date().toISOString(),
      paymentLabel,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
      shippingLabel: shipping === 0 ? 'Miễn phí' : formatVnd(shipping),
      subtotal,
      shipping,
      discount,
      total,
      items,
    }
  }

  const persistOrderSnapshot = (checkoutDoc) => {
    try {
      const snapshot = buildOrderSnapshot(checkoutDoc)
      localStorage.setItem(STORAGE_KEYS.ORDER, JSON.stringify(snapshot))
      return snapshot
    } catch {
      return null
    }
  }

  const getOrderSnapshot = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDER) || 'null')
      if (!parsed || !Array.isArray(parsed.items)) return null
      return parsed
    } catch {
      return null
    }
  }

  const ensureOrderSnapshot = () => getOrderSnapshot() || persistOrderSnapshot()

  const findTextNode = (doc, selector, text) => {
    const target = normalizeString(text)
    return Array.from(doc.querySelectorAll(selector)).find((node) => normalizeString(node.textContent || '') === target)
  }

  const applySuccessOrderData = (doc, order) => {
    if (!order || !Array.isArray(order.items)) return

    const orderCodeText = doc.querySelector('span.font-bold.text-on-surface')
    if (orderCodeText && /PETT-\d{8}-\d{4}|PETT-\d{6}-\d{4}|PETT-/i.test(orderCodeText.textContent || '')) {
      orderCodeText.textContent = order.orderCode
    }

    const productsHeading = findTextNode(doc, 'h2,h3', 'Sản phẩm')
    const productsCard = productsHeading?.closest('div')
    const productsList = productsCard?.querySelector('.flex.flex-col.gap-4')
    if (productsList) {
      productsList.innerHTML = order.items.map((item) => `
        <div class="flex items-center gap-4 bg-surface-container-low p-4 rounded-lg">
          ${(() => {
            const isSubscription = item.category === 'subscription'
              || (typeof item.id === 'string' && item.id.startsWith('plan-'))
              || (typeof item.name === 'string' && item.name.startsWith('Gói'))
            if (isSubscription || !item.image) return ''
            return `<img alt="${item.name}" class="w-20 h-20 object-cover rounded-md" src="${item.image}"/>`
          })()}
          <div class="grow">
            <h3 class="font-headline font-bold text-on-surface">${item.name}</h3>
            <p class="text-sm text-on-surface-variant">${item.description || ''}</p>
            <div class="mt-1 text-sm">SL: <span class="font-medium">${item.quantity}</span></div>
          </div>
          <div class="font-bold text-on-surface whitespace-nowrap">${formatVnd(item.lineTotal)}</div>
        </div>
      `).join('')
    }

    const paymentHeading = findTextNode(doc, 'h2,h3', 'Chi tiết thanh toán')
    const paymentCard = paymentHeading?.closest('div')
      if (paymentCard) {
      const setAmountByLabel = (labelText, value) => {
        const labelNode = Array.from(paymentCard.querySelectorAll('span')).find((span) => normalizeString(span.textContent || '') === normalizeString(labelText))
        const row = labelNode?.closest('.flex.justify-between')
        const valueNode = row?.querySelector('span:last-child')
        if (valueNode) valueNode.textContent = value
      }

      setAmountByLabel('Tạm tính', formatVnd(order.subtotal))
      setAmountByLabel('Phí giao hàng', order.shipping === 0 ? 'Miễn phí' : formatVnd(order.shipping))
      setAmountByLabel('Giảm giá', `-${formatVnd(order.discount)}`)

      const totalLabel = Array.from(paymentCard.querySelectorAll('span')).find((span) => normalizeString(span.textContent || '') === normalizeString('Tổng cộng'))
      const totalRow = totalLabel?.closest('.flex.justify-between.items-center')
      const totalValue = totalRow?.querySelector('span:last-child')
      if (totalValue) totalValue.textContent = formatVnd(order.total)

      const paymentInfo = Array.from(paymentCard.querySelectorAll('div')).find((div) => 
        normalizeString(div.textContent || '').includes(normalizeString('thanh toan qua the')) || 
        normalizeString(div.textContent || '').includes(normalizeString('thanh toan bang vi momo')) || 
        normalizeString(div.textContent || '').includes(normalizeString('thanh toan khi nhan hang'))
      )
      if (paymentInfo) {
        const icon = paymentInfo.querySelector('.material-symbols-outlined')
        paymentInfo.textContent = ` ${order.paymentLabel}`
        if (icon) {
          paymentInfo.prepend(icon)
          icon.classList.add('text-sm')
        }
      }
    }

    const deliveryNameNode = doc.getElementById('success-delivery-name')
    if (deliveryNameNode && order.deliveryName) {
      deliveryNameNode.textContent = order.deliveryName
    }

    const deliveryPhoneNode = doc.getElementById('success-delivery-phone')
    if (deliveryPhoneNode && order.deliveryPhone) {
      deliveryPhoneNode.textContent = order.deliveryPhone
    }

    const deliveryAddressNode = doc.getElementById('success-delivery-address')
    if (deliveryAddressNode && order.deliveryAddress) {
      deliveryAddressNode.textContent = order.deliveryAddress
    }

    // SAVE SUBSCRIPTIONS IF ANY
    const subscriptions = order.items.filter(item => 
      item.category === 'subscription' || 
      (typeof item.id === 'string' && item.id.startsWith('plan-'))
    )
    if (subscriptions.length > 0) {
      try {
        const activeSubs = JSON.parse(localStorage.getItem('pett_active_subscriptions') || '[]')
        let changed = false
        subscriptions.forEach(sub => {
          // Use ID + OrderCode as unique key to prevent duplicates on refresh
          const uniqueId = `${sub.id}_${order.orderCode}`
          if (!activeSubs.find(s => s.uniqueKey === uniqueId)) {
            activeSubs.push({
              ...sub,
              uniqueKey: uniqueId,
              orderCode: order.orderCode,
              startDate: new Date().toLocaleDateString('vi-VN'),
              status: 'active'
            })
            changed = true
          }
        })
        if (changed) {
          localStorage.setItem('pett_active_subscriptions', JSON.stringify(activeSubs))
        }
      } catch (e) {
        console.error('Failed to save subscription', e)
      }
    }
  }

  const applyTrackingOrderData = (doc, order) => {
    if (!order || !Array.isArray(order.items)) return

    const orderCodeNode = Array.from(doc.querySelectorAll('span.font-bold.text-on-surface')).find((span) => /#?PETT-/i.test(span.textContent || ''))
    if (orderCodeNode) {
      orderCodeNode.textContent = `#${order.orderCode}`
    }

    const productsHeading = findTextNode(doc, 'h2,h3', 'Sản phẩm trong đơn')
    const productsCard = productsHeading?.closest('div')
    const productsList = productsCard?.querySelector('.flex.flex-col.gap-4')
    if (productsList) {
      productsList.innerHTML = order.items.map((item) => `
        <div class="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-2xl">
          ${(() => {
            const isSubscription = item.category === 'subscription'
              || (typeof item.id === 'string' && item.id.startsWith('plan-'))
              || (typeof item.name === 'string' && item.name.startsWith('Gói'))
            if (isSubscription || !item.image) return ''
            return `<div class="w-20 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0"><img alt="${item.name}" class="w-full h-full object-cover" src="${item.image}"/></div>`
          })()}
          <div class="flex-1">
            <h4 class="font-headline font-bold text-on-surface line-clamp-1">${item.name}</h4>
            <p class="text-sm text-on-surface-variant mt-1">${item.description || ''}</p>
            <p class="font-bold text-primary mt-2">x${item.quantity}</p>
          </div>
          <div class="font-bold text-on-surface whitespace-nowrap">${formatVnd(item.lineTotal)}</div>
        </div>
      `).join('')
    }
  }

  const applyCartData = (doc) => {
    const itemsContainer = doc.getElementById('cart-items-container')
    const subtotalEl = doc.getElementById('cart-subtotal')
    const shippingEl = doc.getElementById('cart-shipping')
    const totalEl = doc.getElementById('cart-total')
    const headerCountEl = doc.getElementById('cart-count-header')
    const checkoutBtn = doc.getElementById('checkout-btn')

    if (!itemsContainer) return

    const items = cart
    headerCountEl && (headerCountEl.textContent = `${items.length} sản phẩm`)

    if (items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="py-20 text-center">
          <div class="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant/30">
            <span class="material-symbols-outlined text-4xl">shopping_cart_off</span>
          </div>
          <p class="text-on-surface-variant font-medium">Giỏ hàng của bạn đang trống</p>
          <button class="mt-6 px-8 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-all" data-route="/shop">Tiếp tục mua sắm</button>
        </div>
      `
      if (subtotalEl) subtotalEl.textContent = '0₫'
      if (shippingEl) shippingEl.textContent = '0₫'
      if (totalEl) totalEl.textContent = '0₫'
      if (checkoutBtn) {
        checkoutBtn.disabled = true
        checkoutBtn.style.opacity = '0.5'
        checkoutBtn.style.cursor = 'not-allowed'
      }
      return
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = false
      checkoutBtn.style.opacity = '1'
      checkoutBtn.style.cursor = 'pointer'
    }

    itemsContainer.innerHTML = items.map(item => {
      const isSubscription = item.category === 'subscription' || (typeof item.id === 'string' && item.id.startsWith('plan-'))
      const lineTotal = (Number(item.price) || 0) * (item.quantity || 1)
      
      return `
        <div class="flex gap-6 p-6 bg-surface-container-low rounded-3xl group transition-all hover:shadow-md border border-transparent hover:border-surface-container-highest" data-product-card="true" data-route="/product/${item.id}">
            ${isSubscription ? '' : `
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-surface-container shrink-0">
                <img src="${item.image || '/images/pett-bag.webp'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${item.name}">
            </div>`}
            <div class="flex-grow flex flex-col sm:flex-row justify-between gap-4">
                <div class="space-y-1">
                    <h3 class="font-headline font-bold text-lg text-on-surface">${item.name}</h3>
                    <p class="text-sm text-on-surface-variant line-clamp-1">${item.description || ''}</p>
                    <div class="pt-4 flex items-center gap-6">
                        <div class="flex items-center bg-white rounded-full p-1 border border-surface-container-highest">
                            <button data-qty-action="minus" data-item-id="${item.id}" class="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded-full transition-colors">
                                <span class="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span class="w-10 text-center font-bold text-sm">${item.quantity}</span>
                            <button data-qty-action="plus" data-item-id="${item.id}" class="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded-full transition-colors">
                                <span class="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                        <button data-remove-item="${item.id}" class="text-xs font-bold text-coral-500 hover:text-coral-600 uppercase tracking-widest">Xóa</button>
                    </div>
                </div>
                <div class="text-right flex flex-col justify-between">
                    <div class="text-xl font-headline font-black text-primary">${formatVnd(lineTotal)}</div>
                    <div class="text-[10px] text-on-surface-variant font-bold uppercase opacity-50">${formatVnd(item.price)} / sản phẩm</div>
                </div>
            </div>
        </div>
      `
    }).join('')

    const subtotal = items.reduce((s, i) => s + ((Number(i.price) || 0) * (i.quantity || 1)), 0)
    
    // Apply VIP/PRO discount
    let discountPercent = 0
    if (user?.subscription_tier === 'vip') discountPercent = 0.10
    else if (user?.subscription_tier === 'pro') discountPercent = 0.05
    
    const discount = Math.round(subtotal * discountPercent)
    
    const shipping = subtotal >= 500000 ? 0 : 30000
    const total = subtotal + shipping - discount

    if (subtotalEl) subtotalEl.textContent = formatVnd(subtotal)
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Miễn phí' : formatVnd(shipping)
    if (totalEl) totalEl.textContent = formatVnd(total)
  }

  const hydrateCartView = (doc) => {
    const pageTitle = normalizeString(doc.title || '')
    if (pageTitle.includes('gio hang')) {
      applyCartData(doc)
    }
  }

  const hydrateOrderViews = (doc) => {
    const order = ensureOrderSnapshot()
    if (!order) return

    const pageTitle = normalizeString(doc.title || '')
    const isSubscriptionPage = pageTitle.includes('thanh toan goi dinh ky')
    if (isSubscriptionPage) {
      const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]')
      const subItem = items.find(i => i.category === 'subscription')
      if (subItem) {
        doc.defaultView.postMessage({ type: 'PETT_HYDRATE_SUBSCRIPTION', item: subItem }, '*')
        // Send again with a small delay for robustness
        setTimeout(() => {
          doc.defaultView.postMessage({ type: 'PETT_HYDRATE_SUBSCRIPTION', item: subItem }, '*')
        }, 100)
      }
    }

    if (pageTitle.includes('thanh toan thanh cong')) {
      applySuccessOrderData(doc, order)
      return
    }
    if (pageTitle.includes('theo doi don hang')) {
      applyTrackingOrderData(doc, order)
    }
  }

  const updateFilterUI = (doc, filters) => {
    // Update category buttons
    const categoryButtons = doc.querySelectorAll('.category-filter, [data-filter]')
    categoryButtons.forEach(btn => {
      const btnCategory = btn.getAttribute('data-filter')
      const isActive = btnCategory === filters.category
      
      const activeClasses = ['bg-tertiary-fixed', 'text-on-tertiary-fixed', 'font-medium']
      const inactiveClasses = ['bg-surface-container-highest/50', 'text-on-surface-variant']
      const check = btn.querySelector('.filter-check')

      if (isActive) {
        btn.classList.remove(...inactiveClasses)
        btn.classList.add(...activeClasses)
        if (check) check.classList.remove('hidden')
      } else {
        btn.classList.remove(...activeClasses)
        btn.classList.add(...inactiveClasses)
        if (check) check.classList.add('hidden')
      }
    })

    // Update pet filter buttons
    const petButtons = doc.querySelectorAll('.pet-filter-btn, [data-pet-filter]')
    const activePets = new Set(filters.petType.split(','))
    petButtons.forEach(btn => {
      const pet = btn.getAttribute('data-pet-filter')
      btn.classList.toggle('is-active', activePets.has(pet))
    })

    // Update sort chips
    const sortChips = doc.querySelectorAll('.sort-chip, [data-sort]')
    sortChips.forEach(btn => {
      const sort = btn.getAttribute('data-sort')
      const isPrice = sort === 'price'
      const isActive = sort === filters.sort || (isPrice && (filters.sort === 'price_asc' || filters.sort === 'price_desc'))
      
      btn.classList.toggle('sort-chip-active', isActive)
      if (isPrice && isActive) {
        btn.textContent = filters.sort === 'price_asc' ? 'Giá ↑' : 'Giá ↓'
      }
    })

    // Update search clear button
    const clearBtn = doc.getElementById('clear-search')
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !filters.search)
    }
    
    // Update empty state
    const productGrid = doc.querySelector('[data-product-grid]')
    const emptyState = doc.getElementById('empty-products')
    if (productGrid && emptyState) {
      const hasProducts = productGrid.children.length > 0
      // Always show grid for now to debug, and only show empty state if truly no products after load
      productGrid.style.display = 'grid' 
      emptyState.classList.toggle('show', !hasProducts)
    }
  }

  const injectDynamicProducts = async (doc, filters = {}) => {
    const productGrid = doc.querySelector('[data-product-grid]')
    if (!productGrid) return

    try {
      const params = {}
      if (filters.category && filters.category !== 'all') params.category = filters.category
      if (filters.petType) params.pet_type = filters.petType
      if (filters.search) params.q = filters.search
      if (filters.sort) params.sort = filters.sort
      
      const products = await fetchProducts(params)
      console.log('Fetched products:', products)
      productsRef.current = products
      
      // Clean existing products
      productGrid.innerHTML = ''
      
      if (!products || products.length === 0) {
        const emptyState = doc.getElementById('empty-products')
        const productGrid = doc.querySelector('[data-product-grid]')
        if (emptyState) {
          const msg = emptyState.querySelector('p')
          if (msg) msg.textContent = 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.'
          emptyState.classList.add('show')
        }
        if (productGrid) productGrid.style.display = 'none'
        updateFilterUI(doc, filters)
        return
      }

      products.forEach(product => {
        const card = doc.createElement('div')
        card.className = "group relative flex flex-col reveal-up"
        card.setAttribute('data-product-card', 'true')
        card.setAttribute('data-category', product.category)
        card.setAttribute('data-route', `/product/${product.id}`)
        
        card.innerHTML = `
          <div class="product-image-frame relative aspect-4/5 rounded-xl overflow-hidden bg-surface-container mb-4">
            <img alt="${product.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${product.images[0]}"/>
            <button class="product-add-btn absolute bottom-4 right-4 w-12 h-12 bg-primary text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center" data-add-to-cart="true">
              <span class="material-symbols-outlined">add_shopping_cart</span>
            </button>
          </div>
          <div class="px-1 flex flex-col flex-1">
            <div class="flex justify-between items-start mb-1">
              <h3 class="font-headline font-bold text-lg leading-tight text-on-surface group-hover:text-primary transition-colors">${product.name}</h3>
              <div class="flex items-center text-tertiary">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                <span class="text-xs font-bold ml-1">${product.rating.toFixed(1)}</span>
              </div>
            </div>
            <p class="text-sm text-on-surface-variant mb-4 line-clamp-2">${product.summary}</p>
            <div class="flex items-center justify-between mt-auto">
              <span class="text-xl font-extrabold text-on-surface">${formatVnd(product.price)}</span>
              <button class="text-primary font-headline font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Chi tiết <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div class="inline-action-row grid grid-cols-2 gap-2 mt-4">
              <button class="inline-add-btn bg-teal-50 text-primary py-2 rounded-full font-bold text-sm" data-add-to-cart="true">
                <span class="material-symbols-outlined text-sm mr-1">add_shopping_cart</span> Thêm vào giỏ
              </button>
              <button class="inline-buy-btn bg-primary text-white py-2 rounded-full font-bold text-sm" data-add-to-cart="true" data-buy-now="true">
                Mua ngay
              </button>
            </div>
          </div>
        `
        productGrid.appendChild(card)
      })

      updateFilterUI(doc, filters)
    } catch (err) {
      console.error('Failed to inject products', err)
      const emptyState = doc.getElementById('empty-products')
      const productGrid = doc.querySelector('[data-product-grid]')
      if (emptyState) {
        const msg = emptyState.querySelector('p')
        if (msg) msg.textContent = `Lỗi kết nối: ${err.message}. Vui lòng kiểm tra Backend.`
        emptyState.classList.add('show')
      }
      if (productGrid) productGrid.style.display = 'none'
    }
  }

  const injectDynamicBlogs = async (doc) => {
    const blogGrid = doc.querySelector('.blog-tone-grid .grid')
    if (!blogGrid) return

    try {
      const blogs = await fetchBlogs()
      if (!blogs || blogs.length === 0) return

      blogGrid.innerHTML = ''
      
      blogs.forEach((blog, index) => {
        const card = doc.createElement('div')
        card.className = "group cursor-pointer bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/30 reveal-up"
        card.setAttribute('style', `--delay: ${40 * (index + 1)}ms`)
        card.setAttribute('data-route', `/blog/${blog.id}`)
        
        card.innerHTML = `
          <div class="relative mb-6 rounded-lg overflow-hidden h-72">
            <img alt="${blog.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${blog.image_url}"/>
          </div>
          <div class="space-y-3">
            <div class="text-primary font-bold text-sm font-headline tracking-wide uppercase">${blog.category}</div>
            <h3 class="text-2xl font-bold font-headline leading-snug group-hover:text-primary transition-colors">${blog.title}</h3>
            <p class="text-on-surface-variant line-clamp-2">${blog.excerpt}</p>
            <div class="text-xs font-medium text-slate-400 uppercase tracking-widest pt-2">${blog.author} • ${blog.read_time} phút</div>
          </div>
        `
        blogGrid.appendChild(card)
      })
    } catch (err) {
      console.error('Failed to inject blogs', err)
    }
  }

  const injectDynamicProductDetail = async (doc, productId) => {
    if (!productId) return

    try {
      const product = await fetchProduct(productId)
      if (!product) return

      // Update Main Image
      const mainImg = doc.querySelector('[data-product-main-image]')
      if (mainImg) {
        mainImg.src = product.images[0]
        mainImg.alt = product.name
        mainImg.classList.remove('object-cover')
        mainImg.classList.add('object-contain')
      }

      // Update Thumbnails
      const thumbContainer = doc.querySelector('[data-product-thumbnails]')
      if (thumbContainer) {
        thumbContainer.innerHTML = product.images.map((img, idx) => `
          <div class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden ${idx === 0 ? 'border-2 border-primary ring-offset-2 ring-2 ring-primary/20' : 'opacity-60 hover:opacity-100 transition-opacity'} cursor-pointer">
            <img alt="Thumbnail ${idx + 1}" class="w-full h-full object-cover" src="${img}"/>
          </div>
        `).join('')
      }

      // Update Info
      const nameEl = doc.querySelector('[data-product-name]')
      if (nameEl) nameEl.textContent = product.name

      const summaryEl = doc.querySelector('[data-product-summary]')
      if (summaryEl) summaryEl.textContent = product.summary

      const priceEl = doc.querySelector('[data-product-price]')
      if (priceEl) priceEl.textContent = formatVnd(product.price)

      const originalPriceEl = doc.querySelector('[data-product-original-price]')
      if (originalPriceEl) {
        originalPriceEl.textContent = product.original_price ? formatVnd(product.original_price) : ''
        originalPriceEl.style.display = product.original_price ? 'inline' : 'none'
      }

      // Update Ratings
      const ratingStars = doc.querySelector('.flex.text-tertiary')
      if (ratingStars) {
        const fullStars = Math.floor(product.rating || 5)
        const hasHalf = (product.rating || 5) % 1 !== 0
        let starsHtml = ''
        for (let i = 0; i < fullStars; i++) starsHtml += '<span class="material-symbols-outlined fill-icon text-sm">star</span>'
        if (hasHalf) starsHtml += '<span class="material-symbols-outlined fill-icon text-sm">star_half</span>'
        ratingStars.innerHTML = starsHtml
      }
      const reviewsCountEl = doc.querySelector('.text-xs.font-medium.text-on-surface-variant')
      if (reviewsCountEl) reviewsCountEl.textContent = `(${product.reviews_count || 124} đánh giá)`

      // Update Benefits
      const benefitsContainer = doc.querySelector('.space-y-4.mb-10')
      if (benefitsContainer && product.benefits) {
        benefitsContainer.innerHTML = product.benefits.map(benefit => `
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-primary-container">check_circle</span>
            <div>
              <p class="font-bold text-on-surface leading-tight">${benefit.title || benefit}</p>
              <p class="text-sm text-on-surface-variant">${benefit.desc || 'Sản phẩm đạt chuẩn chất lượng cao cho thú cưng.'}</p>
            </div>
          </div>
        `).join('')
      }

      // Update Related Products
      const relatedGrid = doc.querySelector('[data-related-grid]')
      if (relatedGrid) {
        try {
          const allProducts = await fetchProducts({ category: product.category })
          const related = allProducts.filter(p => p.id !== product.id).slice(0, 3)
          
          if (related.length > 0) {
            relatedGrid.innerHTML = related.map(p => `
              <div class="bg-surface-container-low rounded-xl p-4 group cursor-pointer" data-route="/product/${p.id}">
                <div class="aspect-square rounded-lg overflow-hidden mb-4 relative bg-surface-container-lowest">
                  <img alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" src="${p.images[0]}"/>
                </div>
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-bold text-on-surface">${p.name}</h4>
                    <p class="text-xs text-on-surface-variant">${p.category === 'nutrition' ? 'Dinh dưỡng' : 'Phụ kiện'}</p>
                  </div>
                  <span class="font-bold text-secondary-container">${formatVnd(p.price)}</span>
                </div>
              </div>
            `).join('')
          }
        } catch (e) {
          console.error('Failed to load related products', e)
        }
      }

      // Update Breadcrumbs
      const breadcrumbName = doc.querySelector('[data-breadcrumb-product]')
      if (breadcrumbName) breadcrumbName.textContent = product.name
      
      const breadcrumbCategory = doc.querySelector('[data-breadcrumb-category]')
      if (breadcrumbCategory) {
          const catMap = { 
            nutrition: 'Dinh dưỡng', 
            toys: 'Đồ vận chuyển, nuôi nhốt', 
            accessories: 'Phụ kiện' 
          }
          breadcrumbCategory.textContent = catMap[product.category] || 'Sản phẩm'
          breadcrumbCategory.href = '/shop'
          breadcrumbCategory.setAttribute('data-route', '/shop')
      }

    } catch (err) {
      console.error('Failed to inject product detail', err)
    }
  }


  const paintCartBadge = (doc) => {
    if (!doc) return
    const count = getTotalItems()
    const cartButtons = Array.from(doc.querySelectorAll('button, a')).filter((node) => {
      const text = normalizeString(node.textContent || '')
      const route = node.getAttribute('data-route') || node.getAttribute('href') || ''
      const isCartLink = route.startsWith('/cart')
      return isCartLink || text.includes('shopping_bag') || (text.includes('shopping_cart') && !text.includes('add_shopping_cart'))
    })

    cartButtons.forEach((button) => {
      button.style.position = button.style.position || 'relative'

      let badge = button.querySelector('[data-cart-badge]')
      if (!badge) {
        badge = doc.createElement('span')
        badge.setAttribute('data-cart-badge', 'true')
        badge.style.position = 'absolute'
        badge.style.top = '-4px'
        badge.style.right = '-4px'
        badge.style.minWidth = '18px'
        badge.style.height = '18px'
        badge.style.padding = '0 5px'
        badge.style.borderRadius = '9999px'
        badge.style.display = 'none'
        badge.style.alignItems = 'center'
        badge.style.justifyContent = 'center'
        badge.style.background = '#14b8a6'
        badge.style.color = '#ffffff'
        badge.style.fontSize = '11px'
        badge.style.fontWeight = '700'
        badge.style.lineHeight = '1'
        button.appendChild(badge)
      }

      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : String(count)
        badge.style.display = 'inline-flex'
      } else {
        badge.style.display = 'none'
      }
    })
  }

  const paintUserStatus = (doc) => {
    if (!doc || !user) return
    const userButtons = Array.from(doc.querySelectorAll('button, a')).filter((node) => {
      const text = normalizeString(node.textContent || '')
      const route = node.getAttribute('data-route') || node.getAttribute('href') || ''
      return route.startsWith('/login') || text.includes('person') || text.includes('account_circle')
    })

    userButtons.forEach((button) => {
      button.setAttribute('data-route', '/profile')
      if (button.tagName === 'A') {
        button.setAttribute('href', '/profile')
      }
    })
  }

  const optimizeEmbeddedMedia = (doc) => {
    if (!doc) return

    const viewportHeight = Math.max(window.innerHeight || 0, 1)
    const images = Array.from(doc.querySelectorAll('img'))

    images.forEach((img, index) => {
      if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async')

      const rect = img.getBoundingClientRect()
      const isEarlyImage = index < 2
      const isNearViewport = rect.top < viewportHeight * 1.2
      if (isEarlyImage || isNearViewport) return

      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy')
      if (!img.getAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low')
    })

    const videos = Array.from(doc.querySelectorAll('video'))
    videos.forEach((video) => {
      if (!video.hasAttribute('preload')) {
        video.setAttribute('preload', video.hasAttribute('autoplay') ? 'auto' : 'metadata')
      }
      if (!video.hasAttribute('playsinline')) video.setAttribute('playsinline', '')
    })
  }



  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Note: useGoogleLogin by default returns an access_token (Implicit Flow)
      // But our backend expects an ID Token or we need to exchange it.
      // For simplicity with @react-oauth/google, we might need 'auth-code' flow
      // or just use the credential response from the standard button.
      // Let's use the 'implicit' token for now if backend can handle it, 
      // or switch to the standard GoogleLogin component if needed.
      console.log('Google login success:', tokenResponse)
      // Actually, let's use the credential from the standard button flow if possible.
      // But since we are inside an iframe, custom hook is better.
      try {
        await loginWithGoogle(tokenResponse.access_token)
        // Let the parent component (like login.jsx) handle the redirect via AuthContext state
      } catch (err) {
        console.error('Auth failed', err)
      }
    },
    onError: (error) => console.log('Login Failed:', error)
  })
  useEffect(() => {
    // Reset scroll positions whenever the stitched HTML changes.
    window.scrollTo(0, 0)
    // Also reset the iframe's internal scroll when it's ready
    const iframe = iframeRef.current
    if (iframe) {
      try {
        iframe.contentWindow?.scrollTo(0, 0)
        if (iframe.contentDocument?.body) {
          iframe.contentDocument.body.scrollTop = 0
          iframe.contentDocument.documentElement.scrollTop = 0
        }
      } catch {
        // cross-origin guard
      }
    }
  }, [html])

  // Re-inject products when filters change
  useEffect(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) return
    
    const pageTitle = normalizeString(doc.title || '')
    if (pageTitle.includes('cua hang')) {
      injectDynamicProducts(doc, filters)
    }
  }, [filters])

  // Re-inject cart when cart state changes
  useEffect(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) return
    
    // Always update the badge count across all pages
    paintCartBadge(doc)

    const pageTitle = normalizeString(doc.title || '')
    if (pageTitle.includes('gio hang')) {
      hydrateCartView(doc)
    }
  }, [cart])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    let resizeObserver = null

    const syncParentViewport = (doc) => {
      const parentViewportHeight = Math.max(window.innerHeight || 0, 1)
      doc.documentElement.style.setProperty('--pett-parent-vh', `${Math.round(parentViewportHeight)}px`)
    }

    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument
        if (!doc) return
        syncParentViewport(doc)

        // In viewport mode, keep iframe locked to the parent viewport height
        // so sticky/fixed elements inside stitched HTML stay pinned to the top.
        if (!fitContent) {
          setHeight(getViewportHeight())
          return
        }

        const measuredHeight = Math.max(
          doc.body?.scrollHeight || 0,
          doc.body?.offsetHeight || 0,
          doc.documentElement?.scrollHeight || 0,
          doc.documentElement?.offsetHeight || 0,
        )
        if (measuredHeight <= 0) return
        if (measuredHeight > 0) setHeight(measuredHeight)
      } catch {
        // Ignore sizing errors; fallback height is used.
      }
    }

    const onLoad = () => {
      // Scroll iframe internals to top on every fresh load
      try {
        iframe.contentWindow?.scrollTo(0, 0)
        if (iframe.contentDocument?.body) {
          iframe.contentDocument.body.scrollTop = 0
          iframe.contentDocument.documentElement.scrollTop = 0
        }

        const doc = iframe.contentDocument
        if (doc) {
          const pageTitle = normalizeString(doc.title || '')
          const urlProductId = window.location.pathname.split('/').pop()

          if (pageTitle.includes('cua hang')) {
            injectDynamicProducts(doc, filters)
          } else if (pageTitle.includes('gio hang')) {
            hydrateCartView(doc)
          } else if (pageTitle.includes('chi tiet san pham') || pageTitle.includes('product detail') || (urlProductId && doc.querySelector('[data-product-card]'))) {
            injectDynamicProductDetail(doc, urlProductId)
          } else if (pageTitle.includes('blog')) {
            injectDynamicBlogs(doc)
          }
          
          paintUserStatus(doc)
          paintCartBadge(doc)
        }
      } catch (err) {
        console.error('Error in onLoad dynamic injection:', err)
      }
      
      updateHeight()
      requestAnimationFrame(updateHeight)
      setTimeout(updateHeight, 200)
      setTimeout(updateHeight, 800)

      try {
        const doc = iframe.contentDocument
        if (!doc) return
        optimizeEmbeddedMedia(doc)
        paintCartBadge(doc)
        paintUserStatus(doc)

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(updateHeight)
          resizeObserver.observe(doc.documentElement)
          if (doc.body) resizeObserver.observe(doc.body)
        }

        const inferRouteFromText = (label) => {
          const text = normalizeString(label || '')
          if (!text) return null

          if (
            text.includes('thanh toan ngay') ||
            text.includes('tien hanh thanh toan') ||
            text.includes('den trang thanh toan')
          ) return '/checkout'

          if (text.includes('dat hang ngay')) return '/checkout/success'
          if (text.includes('quay lai gio hang')) return '/cart'
          if (text.includes('theo doi don hang')) return '/order-tracking'
          if (text.includes('mua lai don nay')) return '/shop'

          if (
            text.includes('shopping_cart') ||
            text.includes('shopping_bag') ||
            text.includes('gio hang') ||
            text.includes('cart')
          ) return '/cart'

          if (
            text.includes('xem tat ca') ||
            text.includes('mua bo suu tap') ||
            text.includes('kham pha tat ca san pham') ||
            text.includes('mua toan bo san pham') ||
            text.includes('xem nhanh') ||
            text.includes('san pham') ||
            text.includes('cua hang')
          ) return '/shop'

          if (
            text.includes('goi dinh ky') ||
            text.includes('dang ky ngay') ||
            text.includes('chon goi') ||
            text.includes('tuy chinh hop') ||
            text.includes('bat dau ngay') ||
            text.includes('tim hieu them')
          ) return '/goi-dinh-ky'

          if (
            text.includes('doc them') ||
            text.includes('doc tiep') ||
            text.includes('doc moi') ||
            text.includes('blog')
          ) return '/blog'

          if (text.includes('chinh sach bao mat')) return '/privacy-policy'
          if (text.includes('dieu khoan dich vu')) return '/terms-of-service'

          return null
        }

        const parseProductPrice = (label) => {
          const text = (label || '').trim().toLowerCase()
          const digits = text.replace(/[^\d.]/g, '')
          if (!digits) return 0
          
          let value = 0
          if (text.includes('$')) {
            const usd = Number.parseFloat(digits)
            value = Number.isFinite(usd) ? Math.round(usd * 1000) : 0
          } else {
            value = Number.parseInt(digits.replace(/\./g, ''), 10)
          }

          // Handle 'k' notation (e.g., 499k -> 499000)
          if (text.includes('k') && value < 10000) {
            value *= 1000
          }
          
          return Number.isFinite(value) ? value : 0
        }

        const persistStitchCartItem = (item) => {
          addToCart(item)
          paintCartBadge(doc)
        }

        const persistSubscriptionPlanItem = (buttonNode) => {
          if (!buttonNode) return

          // Requirement: Must be logged in to subscribe
          if (!user) {
            navigate('/login', { state: { from: location } })
            return
          }

          const id = buttonNode.getAttribute('data-subscription-id')?.trim()
          
          // NEW: Only 1 active subscription allowed
          const activeSubs = JSON.parse(localStorage.getItem('pett_active_subscriptions') || '[]')
          if (activeSubs.some(s => s.status === 'active')) {
            alert('Bạn đang có một gói dịch vụ đang hoạt động. Vui lòng hủy gói cũ tại trang Hồ sơ trước khi đăng ký gói mới.')
            navigate('/profile')
            return
          }

          const name = buttonNode.getAttribute('data-subscription-name')?.trim() || 'Gói định kỳ PETT'
          const description = buttonNode.getAttribute('data-subscription-description')?.trim() || 'Gói chăm sóc theo tháng'
          const image = buttonNode.getAttribute('data-subscription-image')?.trim() || '/images/pett-bag.webp'
          const rawPrice = buttonNode.getAttribute('data-subscription-price') || '0'
          const price = parseInt(rawPrice.replace(/[^\d]/g, ''), 10)

          if (!id || !Number.isFinite(price) || price <= 0) return

          // Clear cart first so subscription is the only item (standalone purchase)
          clearCart()

          addToCart({
            id,
            name,
            description,
            price,
            priceLabel: formatVnd(price),
            image,
            quantity: 1,
            category: 'subscription',
            source: 'shop-stitch',
          })
          paintCartBadge(doc)
          // Redirect to the specialized subscription checkout
          navigate('/checkout-subscription')
        }

        const isElementNode = (node) => Boolean(node && node.nodeType === 1 && typeof node.closest === 'function')

        const getEventElement = (event) => {
          const target = event?.target
          if (isElementNode(target)) return target
          if (target?.nodeType === 3 && isElementNode(target.parentElement)) return target.parentElement
          if (typeof event?.composedPath === 'function') {
            const firstElementInPath = event.composedPath().find((node) => isElementNode(node))
            if (firstElementInPath) return firstElementInPath
          }
          return null
        }

        const closestFromEvent = (event, selector) => {
          const element = getEventElement(event)
          return element ? element.closest(selector) : null
        }

        const normalizeInternalRoute = (rawRoute) => {
          if (!rawRoute) return null
          const route = rawRoute.trim()
          if (!route || route.startsWith('#')) return null

          const isExternalProtocol = /^(mailto:|tel:|javascript:)/i.test(route)
          if (isExternalProtocol) return null

          if (route.startsWith('/')) return route

          if (/^https?:\/\//i.test(route)) {
            try {
              const parsed = new URL(route, window.location.origin)
              if (parsed.origin !== window.location.origin) return null
              return `${parsed.pathname}${parsed.search}${parsed.hash}`
            } catch {
              return null
            }
          }

          return null
        }

        const navigateInternal = (event, route) => {
          if (!route || !route.startsWith('/')) return false
          event.preventDefault()
          event.stopPropagation()
          navigate(route)
          window.scrollTo(0, 0)
          return true
        }

        // --- EVENT HANDLERS ---
        const handleAuthAction = async (actionNode) => {
          const action = actionNode.getAttribute('data-action')
          if (action === 'google-login') {
            handleGoogleLogin()
            return true
          }
          return false
        }

        const handleNavigation = (event, routedNode) => {
          if (routedNode.hasAttribute('data-subscription-id')) {
            persistSubscriptionPlanItem(routedNode)
            return true
          }

          const rawRoute = routedNode.getAttribute('data-route')
          const route = normalizeInternalRoute(rawRoute)
          
          if (route) {
            // NEW: Auth check for cart and checkout
            if ((route.startsWith('/checkout') || route.startsWith('/cart')) && !user) {
              return navigateInternal(event, '/login')
            }

            if (route === '/checkout/success') {
              // If we are already on the MoMo page, the order is already persisted
              if (doc.title.includes('MoMo')) {
                return navigateInternal(event, route)
              }

              const validateCheckout = doc?.defaultView?.__pettValidateCheckout
              if (typeof validateCheckout === 'function' && !validateCheckout()) return true
              
              // Robust MoMo Redirection logic
              const momoRadio = doc.getElementById('checkout-payment-card')
              const isMoMoSelected = momoRadio && momoRadio.checked
              
              // Also check by searching for the checked radio if ID fails for some reason
              const checkedRadio = doc.querySelector('input[name="payment"]:checked')
              const isMoMoFallback = checkedRadio && (checkedRadio.id === 'checkout-payment-card' || checkedRadio.closest('#checkout-payment-card-option'))

              if (isMoMoSelected || isMoMoFallback) {
                // Persist snapshot before leaving the checkout page
                if (persistOrderSnapshot(doc)) {
                  clearCart()
                  paintCartBadge(doc)
                  return navigateInternal(event, '/checkout/momo')
                }
                return true
              }

              if (persistOrderSnapshot(doc)) {
                clearCart()
                paintCartBadge(doc)
              }
            }
            return navigateInternal(event, route)
          }
          return false
        }

        const handleCartAction = (button) => {
          const buttonText = normalizeString(button.textContent)
          if (buttonText.includes('add_shopping_cart') || button.hasAttribute('data-add-to-cart')) {
            if (!user) {
              navigate('/login', { state: { from: location } })
              return true
            }
            const card = button.closest('[data-product-card]')
            if (card) {
              const qty = doc.getElementById('product-quantity') ? (parseInt(doc.getElementById('product-quantity').value) || 1) : 1
              
              // Get ID from data-route (e.g. /product/123)
              const route = card.getAttribute('data-route') || ''
              const productId = route.split('/').pop()
              
              // Try to find the product in our fetched list
              const product = productsRef.current.find(p => String(p.id) === productId)
              
              if (product) {
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: Array.isArray(product.images) ? product.images[0] : (product.images || '/images/pett-bag.webp'),
                  description: product.summary || product.description || '',
                  category: product.category,
                  quantity: qty,
                  source: 'shop-stitch'
                })
              } else {
                // Fallback to scraping if product not in list (e.g. on detail page)
                // Prioritize data- attributes for accuracy
                const name = card.querySelector('[data-product-name]')?.textContent?.trim() || card.querySelector('h1')?.textContent?.trim() || card.querySelector('h3')?.textContent?.trim() || 'Sản phẩm'
                const priceEl = card.querySelector('[data-product-price]') || card.querySelector('.text-xl.font-extrabold') || card.querySelector('.text-4xl.font-black')
                const priceLabel = priceEl?.textContent?.trim() || '0'
                const image = card.querySelector('img')?.getAttribute('src') || ''
                const category = card.getAttribute('data-category') || 'shop'
                
                addToCart({
                  id: productId || `${normalizeString(name).replace(/\s+/g, '-')}-${category}`,
                  name,
                  price: parseProductPrice(priceLabel),
                  image,
                  description: card.querySelector('p')?.textContent?.trim() || '',
                  category,
                  quantity: qty,
                  source: 'shop-stitch'
                })
              }
              
              paintCartBadge(doc)
              if (button.hasAttribute('data-buy-now')) navigate('/checkout')
            }
            return true
          }
          return false
        }

        const onInput = (event) => {
          const target = event.target
          if (target && target.id === 'product-search') {
            setFilters(prev => ({ ...prev, search: target.value }))
          }
        }

        const onClick = async (event) => {
          const button = closestFromEvent(event, 'button')
          if (button) {
            if (handleCartAction(button)) {
              event.preventDefault()
              return
            }

            // Intercept filters
            const category = button.getAttribute('data-filter')
            if (category || button.classList.contains('category-filter')) {
              setFilters(prev => ({ ...prev, category: category || 'all' }))
              return
            }

            const pet = button.getAttribute('data-pet-filter')
            if (pet || button.classList.contains('pet-filter-btn')) {
              setFilters(prev => {
                const current = new Set(prev.petType.split(','))
                if (current.has(pet) && current.size > 1) {
                  current.delete(pet)
                } else {
                  current.add(pet)
                }
                return { ...prev, petType: Array.from(current).join(',') }
              })
              return
            }

            const sort = button.getAttribute('data-sort')
            if (sort || button.classList.contains('sort-chip')) {
              setFilters(prev => {
                if (sort === 'price') {
                  return { ...prev, sort: prev.sort === 'price_asc' ? 'price_desc' : 'price_asc' }
                }
                return { ...prev, sort: sort || 'popular' }
              })
              return
            }

            if (button.id === 'clear-search') {
              const searchInput = doc.getElementById('product-search')
              if (searchInput) searchInput.value = ''
              setFilters(prev => ({ ...prev, search: '' }))
              return
            }

            // Cart Actions
            const qtyAction = closestFromEvent(event, '[data-qty-action]')
            if (qtyAction) {
              const action = qtyAction.getAttribute('data-qty-action')
              const itemId = qtyAction.getAttribute('data-item-id')
              const item = cart.find(i => String(i.id) === String(itemId))
              if (item) {
                const newQty = action === 'plus' ? item.quantity + 1 : item.quantity - 1
                updateQuantity(itemId, newQty)
              }
              return
            }

            const removeItemBtn = closestFromEvent(event, '[data-remove-item]')
            if (removeItemBtn) {
              const itemId = removeItemBtn.getAttribute('data-remove-item')
              removeFromCart(itemId)
              return
            }

            const isLocalFilterControl =
              button.hasAttribute('data-filter') ||
              button.hasAttribute('data-pet-filter') ||
              button.hasAttribute('data-sort') ||
              button.hasAttribute('data-category') ||
              button.id === 'clear-search' ||
              button.classList.contains('category-filter') ||
              button.classList.contains('pet-filter-btn') ||
              button.classList.contains('sort-chip') ||
              button.hasAttribute('data-qty-action') ||
              button.hasAttribute('data-remove-item')

            if (isLocalFilterControl) return
            
            const fallbackRoute = inferRouteFromText(button.textContent)
            if (fallbackRoute) navigateInternal(event, fallbackRoute)
          }

          const actionNode = closestFromEvent(event, '[data-action]')
          if (actionNode && await handleAuthAction(actionNode)) return

          // Handle quantity buttons
          const qtyBtn = closestFromEvent(event, '[data-qty]')
          if (qtyBtn) {
            const input = doc.getElementById('product-quantity')
            if (input) {
              let val = parseInt(input.value) || 1
              if (qtyBtn.getAttribute('data-qty') === 'plus') val++
              else if (val > 1) val--
              input.value = val
            }
            return
          }

          const routedNode = closestFromEvent(event, '[data-route]')
          if (routedNode && handleNavigation(event, routedNode)) return

          const anchor = closestFromEvent(event, 'a[href]')
          if (anchor) {
            const href = anchor.getAttribute('href')
            if (href && (/^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:'))) return

            const routeFromAnchor = normalizeInternalRoute(anchor.getAttribute('data-route') || href)
            if (routeFromAnchor && navigateInternal(event, routeFromAnchor)) return

            const fallbackRoute = inferRouteFromText(anchor.textContent)
            if ((!href || href.startsWith('#')) && fallbackRoute && navigateInternal(event, fallbackRoute)) return
          }
        }

        if (doc.__pettNavHandler) {
          doc.removeEventListener('click', doc.__pettNavHandler, true)
        }
        if (doc.__pettInputHandler) {
          doc.removeEventListener('input', doc.__pettInputHandler, true)
        }
        doc.__pettNavHandler = onClick
        doc.__pettInputHandler = onInput
        doc.addEventListener('click', onClick, true)
        doc.addEventListener('input', onInput, true)

        hydrateOrderViews(doc)
      } catch {
        // Ignore cross-document access errors.
      }
    }

    iframe.addEventListener('load', onLoad)
    window.addEventListener('resize', updateHeight)

    return () => {
      iframe.removeEventListener('load', onLoad)
      window.removeEventListener('resize', updateHeight)
      if (resizeObserver) resizeObserver.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitContent, html, navigate, loginWithGoogle, user, cart, addToCart, clearCart, updateQuantity, removeFromCart, filters])


  return (
    <section className="w-full bg-background relative" style={{ backgroundColor: '#fbfaee' }}>


      <iframe
        ref={iframeRef}
        title={title}
        srcDoc={html}
        className="w-full border-0"
        style={{ height: `${height}px` }}
      />
    </section>
  )
}
