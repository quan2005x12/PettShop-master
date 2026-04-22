import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './authContext'

const CartContext = createContext()
const STORAGE_KEY = 'pett_stitch_cart_v2'

const getStoredCart = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(getStoredCart)

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    const addedQuantity = Math.max(1, Number(product.quantity) || 1)

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + addedQuantity } : item
        )
      }
      return [...prev, { 
        ...product, 
        quantity: addedQuantity, 
        source: 'shop-stitch' // Maintain compatibility with Stitched pages
      }]
    })
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const { user } = useAuth()

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0)
  }

  const getVipDiscount = () => {
    if (user?.subscription_tier === 'vip') {
      return Math.round(getSubtotal() * 0.15)
    }
    if (user?.subscription_tier === 'pro') {
      return Math.round(getSubtotal() * 0.1)
    }
    return 0
  }

  const getTotalPrice = () => {
    return (getSubtotal() - getVipDiscount()).toFixed(0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, 
      getSubtotal, getVipDiscount, getTotalPrice, getTotalItems 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

