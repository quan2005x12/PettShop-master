export const API_BASE_URL = 'http://localhost:8000/api'

const getAuthHeader = () => {
  const token = localStorage.getItem('pett_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const fetchProducts = async (params = {}) => {
  const url = new URL(`${API_BASE_URL}/products`)
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== 'undefined') {
      url.searchParams.append(key, params[key])
    }
  })
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch products')
  return response.json()
}

export const fetchProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`)
  if (!response.ok) throw new Error('Failed to fetch product')
  return response.json()
}

export const fetchOrders = async () => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: getAuthHeader()
  })
  if (!response.ok) throw new Error('Failed to fetch orders')
  return response.json()
}

export const createOrder = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(orderData)
  })
  if (!response.ok) throw new Error('Failed to create order')
  return response.json()
}


export const fetchBlogs = async () => {
  const response = await fetch(`${API_BASE_URL}/blogs`)
  if (!response.ok) throw new Error('Failed to fetch blogs')
  return response.json()
}

export const fetchBlog = async (id) => {
  const response = await fetch(`${API_BASE_URL}/blogs/${id}`)
  if (!response.ok) throw new Error('Failed to fetch blog')
  return response.json()
}

export const loginWithGoogle = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: token })
  })
  if (!response.ok) throw new Error('Login failed')
  return response.json()
}

export const fetchMe = async (token) => {
  const header = token ? { 'Authorization': `Bearer ${token}` } : getAuthHeader()
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { ...header }
  })
  if (!response.ok) {
    const errorText = await response.text()
    console.error('fetchMe error response:', errorText)
    throw new Error('Failed to fetch user profile')
  }
  return response.json()
}

// --- ADMIN APIs ---

export const adminCreateProduct = async (productData) => {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(productData)
  })
  if (!response.ok) throw new Error('Failed to create product')
  return response.json()
}

export const adminUpdateProduct = async (id, productData) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(productData)
  })
  if (!response.ok) throw new Error('Failed to update product')
  return response.json()
}

export const adminDeleteProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  })
  if (!response.ok) throw new Error('Failed to delete product')
  return response.json()
}

// --- REVIEWS ---

export const fetchReviews = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`)
  if (!response.ok) throw new Error('Failed to fetch reviews')
  return response.json()
}

export const createReview = async (productId, reviewData) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(reviewData)
  })
  if (!response.ok) throw new Error('Failed to create review')
  return response.json()
}

