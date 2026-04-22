import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchProduct, fetchProducts, fetchReviews, createReview } from '../api'
import { useCart } from '../context/cartContext'
import { useAuth } from '../context/authContext'

const getProductImage = (product) => {
  if (!product) return '/images/products/salmon-bites-2.webp'
  let imgs = product.images
  if (typeof imgs === 'string' && imgs.startsWith('[')) {
    try { imgs = JSON.parse(imgs) } catch (e) {}
  }
  if (Array.isArray(imgs) && imgs.length > 0) return imgs[0]
  return product.image_url || '/images/products/salmon-bites-2.webp'
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchProduct(id)
        setProduct(data)
        setSelectedImage(getProductImage(data))
        
        // Fetch related products
        const allProducts = await fetchProducts({ category: data.category })
        setRelated(allProducts.filter(p => p.id !== data.id).slice(0, 3))
        
        // Fetch reviews
        try {
          const revs = await fetchReviews(id)
          setReviews(revs)
        } catch (e) {
          console.error('Failed to fetch reviews:', e)
        }
      } catch (e) {
        console.error('Failed to fetch product:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    window.scrollTo(0, 0)
  }, [id])

  // Animation observer
  useEffect(() => {
    if (loading || !product) return
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.reveal-up, .split-reveal-left, .split-reveal-right').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [product, loading])

  const formatVnd = (v) => (v || 0).toLocaleString('vi-VN') + '₫'

  const categoryMap = {
    nutrition: 'Dinh dưỡng',
    toys: 'Đồ vận chuyển, nuôi nhốt',
    accessories: 'Phụ kiện',
    food: 'Thức ăn',
    health: 'Sức khỏe'
  }

  const handleAddToCart = () => {
    if (!product) return
    addToCart({ ...product, quantity })
  }

  const handleBuyNow = () => {
    if (!product) return
    addToCart({ ...product, quantity })
    navigate('/checkout')
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-32 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 aspect-square bg-stone-100 rounded-[3rem]"></div>
        <div className="lg:col-span-5 space-y-6">
          <div className="h-4 w-1/4 bg-stone-100 rounded-full"></div>
          <div className="h-12 w-3/4 bg-stone-100 rounded-3xl"></div>
          <div className="h-24 w-full bg-stone-100 rounded-[2rem]"></div>
          <div className="h-10 w-1/3 bg-stone-100 rounded-full"></div>
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-7xl mx-auto px-6 py-32 text-center">
      <h1 className="text-2xl font-black text-stone-800 mb-4">Sản phẩm không tồn tại</h1>
      <Link to="/shop" className="text-primary font-bold hover:underline">Quay lại cửa hàng</Link>
    </div>
  )

  return (
    <main className="max-w-7xl mx-auto px-6 pb-32">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 py-8 text-sm font-bold text-stone-400 split-reveal-left">
        <Link className="hover:text-primary transition-colors" to="/shop">Cửa hàng</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary uppercase tracking-widest text-[10px] bg-teal-50 px-3 py-1 rounded-full">{categoryMap[product.category] || product.category}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-stone-800 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-6 split-reveal-left">
          <div className="flex-1 aspect-square rounded-[3rem] overflow-hidden bg-white border border-stone-100 shadow-sm relative group">
            <img 
              src={selectedImage} 
              alt={product.name} 
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
            />
            {product.original_price > product.price && (
              <div className="absolute top-6 left-6 bg-secondary text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-secondary/20 animate-bounce">
                Giảm giá sốc
              </div>
            )}
          </div>
          
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 shrink-0">
            {(() => {
              let imgs = product.images
              if (typeof imgs === 'string' && imgs.startsWith('[')) {
                try { imgs = JSON.parse(imgs) } catch (e) {}
              }
              const displayImgs = (Array.isArray(imgs) && imgs.length > 0) ? imgs : [product.image_url || '/images/products/salmon-bites-2.webp']
              
              return displayImgs.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-primary shadow-lg shadow-primary/10 scale-105' : 'border-stone-100 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                </button>
              ))
            })()}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col justify-start split-reveal-right">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined text-[18px] ${i < Math.floor(product.rating || 5) ? 'fill-icon' : ''}`}>
                  {i < Math.floor(product.rating || 5) ? 'star' : 'star_half'}
                </span>
              ))}
            </div>
            <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">({product.reviews_count || 0} đánh giá)</span>
          </div>

          <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-headline font-black tracking-tighter text-on-surface mb-4 leading-none">{product.name}</h1>
          <p className="text-lg text-on-surface-variant font-medium leading-relaxed mb-8">{product.summary}</p>

          <div className="flex items-center gap-4 mb-10">
            <span className="text-4xl font-black text-primary">{formatVnd(product.price)}</span>
            {product.original_price > product.price && (
              <span className="text-xl line-through text-stone-300 font-bold">{formatVnd(product.original_price)}</span>
            )}
          </div>

          {/* Key Benefits */}
          <div className="space-y-4 mb-12">
            {(product.benefits || [
              { icon: 'verified', title: 'Chất lượng cao', desc: 'Nguyên liệu sạch, quy trình hiện đại.' },
              { icon: 'eco', title: 'Hữu cơ & Tự nhiên', desc: 'Không chất bảo quản, an toàn tuyệt đối.' }
            ]).map((b, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-stone-50 bg-stone-50/30">
                <span className="material-symbols-outlined text-primary bg-white p-2 rounded-xl shadow-sm">{b.icon || 'check_circle'}</span>
                <div>
                  <p className="font-black text-stone-800 text-sm leading-tight mb-1">{b.title}</p>
                  <p className="text-xs text-stone-400 font-medium">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-8 pt-8 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Số lượng:</span>
              <div className="flex items-center bg-white rounded-2xl p-1 border border-stone-100 shadow-sm">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-primary hover:bg-teal-50 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input 
                  className="w-12 text-center bg-transparent border-none focus:ring-0 font-black text-lg text-stone-800" 
                  value={quantity} readOnly
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-primary hover:bg-teal-50 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-3 bg-teal-50 text-primary font-black py-5 rounded-[2rem] border-2 border-teal-100 hover:bg-teal-100 transition-all active:scale-[0.98] uppercase text-xs tracking-widest shadow-sm"
              >
                <span className="material-symbols-outlined">add_shopping_cart</span>
                Thêm giỏ hàng
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-3 bg-primary text-white font-black py-5 rounded-[2rem] shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
              >
                Mua ngay ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Description & Reviews */}
      <section className="mb-24 reveal-up">
        <div className="border-b border-stone-100 mb-10 flex gap-10">
          <button 
            onClick={() => setActiveTab('description')}
            className={`pb-4 font-black uppercase text-xs tracking-widest transition-colors ${activeTab === 'description' ? 'border-b-2 border-primary text-primary' : 'text-stone-300 hover:text-stone-500'}`}
          >Mô tả sản phẩm</button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 font-black uppercase text-xs tracking-widest transition-colors flex items-center gap-2 ${activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : 'text-stone-300 hover:text-stone-500'}`}
          >
            Đánh giá khách hàng
            {reviews.length > 0 && (
              <span className="bg-teal-50 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">{reviews.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'description' ? (
          <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed font-medium">
            {product.description?.split('\n').map((line, i) => (
              <p key={i} className="mb-4">{line}</p>
            )) || 'Chưa có thông tin chi tiết cho sản phẩm này.'}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Review Summary */}
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm text-center min-w-[200px]">
                <div className="text-5xl font-black text-stone-800 mb-2">{product.rating?.toFixed(1) || '5.0'}</div>
                <div className="flex justify-center text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-lg ${i < Math.floor(product.rating || 5) ? 'fill-icon' : ''}`}>
                      {i < Math.floor(product.rating || 5) ? 'star' : 'star_half'}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-bold text-stone-400">{product.reviews_count || 0} đánh giá</p>
              </div>

              {/* Review Form */}
              {user ? (
                <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
                  <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 mb-6">Viết đánh giá của bạn</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xs font-bold text-stone-400 mr-2">Chấm điểm:</span>
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className="transition-transform hover:scale-125 active:scale-95"
                      >
                        <span className={`material-symbols-outlined text-2xl ${star <= reviewForm.rating ? 'text-amber-400 fill-icon' : 'text-stone-200'}`}>star</span>
                      </button>
                    ))}
                    <span className="text-xs font-black text-stone-300 ml-2">{reviewForm.rating}/5</span>
                  </div>
                  <textarea
                    rows="3"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-medium focus:ring-2 focus:ring-teal-600/10 focus:bg-white transition-all outline-none resize-none mb-4"
                  />
                  <button
                    onClick={async () => {
                      if (!reviewForm.comment.trim()) return alert('Vui lòng nhập nội dung đánh giá.')
                      setSubmittingReview(true)
                      try {
                        const newReview = await createReview(id, reviewForm)
                        setReviews(prev => [newReview, ...prev])
                        setReviewForm({ rating: 5, comment: '' })
                        // Refresh product to update rating
                        const updated = await fetchProduct(id)
                        setProduct(updated)
                      } catch (e) {
                        alert('Gửi đánh giá thất bại: ' + e.message)
                      } finally {
                        setSubmittingReview(false)
                      }
                    }}
                    disabled={submittingReview}
                    className="px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/10 hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              ) : (
                <div className="flex-1 bg-stone-50 p-8 rounded-[2.5rem] border border-stone-100 text-center">
                  <span className="material-symbols-outlined text-4xl text-stone-200 mb-4">login</span>
                  <p className="font-bold text-stone-400 mb-4">Đăng nhập để viết đánh giá</p>
                  <Link to="/login" className="px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl inline-block">Đăng nhập</Link>
                </div>
              )}
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex gap-6">
                    <div className="w-12 h-12 rounded-full bg-teal-100 overflow-hidden shrink-0 border-2 border-teal-200">
                      {r.user_pic ? (
                        <img src={r.user_pic} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-teal-600 text-lg">
                          {r.user_name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-black text-stone-800 text-sm">{r.user_name}</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`material-symbols-outlined text-[14px] ${i < r.rating ? 'fill-icon' : ''}`}>
                              {i < r.rating ? 'star' : 'star'}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                          {new Date(r.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-stone-600 font-medium leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-[3rem] border border-stone-100">
                <span className="material-symbols-outlined text-5xl text-stone-200 mb-4">rate_review</span>
                <p className="text-lg font-black text-stone-300 mb-2">Chưa có đánh giá nào</p>
                <p className="text-sm text-stone-400 font-medium">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="reveal-up">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-stone-800 mb-2">Sản phẩm tương tự</h2>
              <p className="text-stone-400 font-medium">Có thể thú cưng của bạn cũng sẽ thích những món này</p>
            </div>
            <Link to="/shop" className="text-primary font-black flex items-center gap-2 hover:underline uppercase text-[10px] tracking-widest">
              Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((p, idx) => (
              <Link 
                key={p.id} 
                to={`/product/${p.id}`}
                className="bg-white rounded-[2.5rem] p-6 border border-stone-50 shadow-sm hover:shadow-xl transition-all duration-500 group"
              >
                <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 bg-stone-50">
                  <img src={getProductImage(p)} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-stone-800 group-hover:text-primary transition-colors">{p.name}</h4>
                  <span className="font-black text-primary">{formatVnd(p.price)}</span>
                </div>
                <p className="text-xs text-stone-300 font-bold uppercase tracking-widest">{categoryMap[p.category] || p.category}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
