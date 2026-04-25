import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProducts, fetchReviews } from '../api'
import { useCart } from '../context/cartContext'


// Helper to parse product images correctly
const getProductImage = (product) => {
  if (!product) return '/images/products/cat-litter-2.webp'
  let imgs = product.images
  if (typeof imgs === 'string' && imgs.startsWith('[')) {
    try { imgs = JSON.parse(imgs) } catch (e) {}
  }
  if (Array.isArray(imgs) && imgs.length > 0) return imgs[0]
  return product.image_url || '/images/products/cat-litter-2.webp'
}

const CATEGORIES = [
  { id: 'all', label: 'Tất cả sản phẩm', icon: 'grid_view' },
  { id: 'nutrition', label: 'Dinh dưỡng', icon: 'restaurant' },
  { id: 'toys', label: 'Đồ chơi & Vận chuyển', icon: 'toys' },
  { id: 'accessories', label: 'Phụ kiện', icon: 'content_cut' },
]

const PET_TYPES = [
  { id: 'dog', label: 'Chó', icon: 'pets' },
  { id: 'cat', label: 'Mèo', icon: 'pets' },
]

export default function ShopPage() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activePets, setActivePets] = useState(['dog', 'cat'])
  const [sort, setSort] = useState('popular')
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Load products
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch (e) {
        console.error('Failed to fetch products:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products].filter(p => p.category?.toLowerCase() !== 'subscription')

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      )
    }

    // Category
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category?.toLowerCase() === activeCategory)
    }

    // Pet Type
    result = result.filter(p => {
      if (!p.pet_type) return true
      const types = Array.isArray(p.pet_type) 
        ? p.pet_type 
        : (typeof p.pet_type === 'string' ? p.pet_type.split(',').map(s => s.trim()) : [p.pet_type]);
      return types.some(t => t && activePets.includes(t.toLowerCase()))
    })

    // Sort
    if (sort === 'price') {
      result.sort((a, b) => a.price - b.price)
    } else if (sort === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    // 'popular' is default (as returned by API)

    return result
  }, [products, search, activeCategory, activePets, sort])

  const togglePet = (id) => {
    setActivePets(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(p => p !== id) : prev) 
        : [...prev, id]
    )
  }

  const formatVnd = (v) => (v || 0).toLocaleString('vi-VN') + '₫'

  // Animation observer
  useEffect(() => {
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
  }, [filteredProducts, loading])

  return (
    <div className="bg-surface min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="relative h-[clamp(300px,40vh,500px)] rounded-[3rem] overflow-hidden bg-surface-container-low flex items-center group">
          <div className="absolute inset-0 z-0 overflow-hidden split-reveal-right">
            <img 
              className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105" 
              src="/images/products/cat-litter-2.webp" 
              alt="Pet care" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 px-12 md:w-2/3 split-reveal-left">
            <span className="inline-block px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-black tracking-[0.2em] rounded-full mb-6 uppercase shadow-sm">
              Bộ sưu tập mới
            </span>
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-headline font-black tracking-tighter text-on-surface mb-6 leading-[0.95]">
              Chăm sóc trọn vẹn cho <br/><span className="text-primary">thú cưng.</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-md font-medium leading-relaxed">
              Khám phá thực phẩm chất lượng cao và phụ kiện hữu ích cho cuộc sống năng động cùng thú cưng.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-[100px] space-y-10">
              <div className="split-reveal-left" style={{'--split-delay': '100ms'}}>
                <h3 className="font-headline font-black text-xs uppercase tracking-[0.15em] text-stone-400 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">filter_list</span> Danh mục
                </h3>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center justify-between px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                        activeCategory === cat.id 
                          ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                          : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                        {cat.label}
                      </div>
                      {activeCategory === cat.id && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="split-reveal-left" style={{'--split-delay': '200ms'}}>
                <h3 className="font-headline font-black text-xs uppercase tracking-[0.15em] text-stone-400 mb-6">Loại thú cưng</h3>
                <div className="flex gap-3">
                  {PET_TYPES.map(pet => (
                    <button 
                      key={pet.id}
                      onClick={() => togglePet(pet.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                        activePets.includes(pet.id)
                          ? 'bg-teal-50 border-teal-200 text-teal-700'
                          : 'bg-white border-stone-100 text-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{pet.icon}</span>
                      {pet.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="grow">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 split-reveal-right">
              <div className="relative w-full md:max-w-md group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 group-focus-within:text-primary transition-colors">search</span>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-stone-100 rounded-full font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-stone-300"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-stone-100 shadow-sm">
                <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest ml-4 mr-2">Sắp xếp</span>
                {[
                  { id: 'popular', label: 'Bán chạy' },
                  { id: 'price', label: 'Giá thấp' },
                  { id: 'newest', label: 'Mới nhất' },
                ].map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setSort(s.id)}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      sort === s.id ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-[2.5rem] h-[420px] animate-pulse border border-stone-100"></div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map((p, idx) => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    index={idx} 
                    onAddToCart={addToCart} 
                    onBuyNow={(p) => { addToCart(p); navigate('/checkout'); }} 
                    onQuickView={() => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-stone-200 reveal-up">
                <span className="material-symbols-outlined text-6xl text-stone-200 mb-6">inventory_2</span>
                <p className="text-xl font-black text-stone-800 mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-stone-400 font-medium mb-8">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
                <button 
                  onClick={() => { setSearch(''); setActiveCategory('all'); setActivePets(['dog', 'cat']); }}
                  className="px-8 py-3 bg-teal-600 text-white font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] transition-all"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
          onAddToCart={addToCart}
          onBuyNow={(p, qty) => { addToCart({ ...p, quantity: qty }); navigate('/checkout'); }}
        />
      )}
    </div>
  )
}

function ProductCard({ product, index, onAddToCart, onBuyNow, onQuickView }) {
  const formatVnd = (v) => (v || 0).toLocaleString('vi-VN') + '₫'

  return (
    <div className="reveal-up group" style={{'--split-delay': `${index * 50}ms`}}>
      <div className="bg-white rounded-[2.5rem] p-4 border border-stone-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-stone-200/40 hover:-translate-y-2 group-hover:border-primary/20">
        <Link to={`/product/${product.id}`} className="relative aspect-square rounded-[2rem] overflow-hidden bg-stone-50 mb-6 block">
          <img 
            src={getProductImage(product)} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          {product.pet_type && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center gap-1.5 z-10">
              <span className="material-symbols-outlined text-[12px] text-primary">pets</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">
                {(() => {
                  const types = Array.isArray(product.pet_type) ? product.pet_type : (typeof product.pet_type === 'string' ? product.pet_type.split(',') : [product.pet_type]);
                  const isDog = types.some(t => t?.toLowerCase().includes('dog'));
                  const isCat = types.some(t => t?.toLowerCase().includes('cat'));
                  if (isDog && isCat) return 'Chó & Mèo';
                  if (isDog) return 'Cho Chó';
                  if (isCat) return 'Cho Mèo';
                  return 'Thú cưng';
                })()}
              </span>
            </div>
          )}
          {/* Quick View Overlay Button */}
          <button 
            onClick={(e) => { e.preventDefault(); onQuickView(); }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
          >
            <div className="bg-white text-primary px-6 py-3 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl animate-in zoom-in duration-300">
              <span className="material-symbols-outlined text-sm">visibility</span>
              Xem nhanh
            </div>
          </button>
        </Link>
        
        <div className="px-2">
          <div className="flex justify-between items-start gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">{product.category}</span>
            <span className="text-primary font-black text-lg">{formatVnd(product.price)}</span>
          </div>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-black text-stone-800 mb-3 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button 
              onClick={() => onAddToCart(product)}
              className="px-4 py-3 bg-stone-50 text-stone-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-teal-50 hover:text-teal-600 transition-all border border-transparent hover:border-teal-100"
            >
              Thêm giỏ
            </button>
            <button 
              onClick={() => onBuyNow(product)}
              className="px-4 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary-dim transition-all shadow-lg shadow-primary/10"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
function QuickViewModal({ product, onClose, onAddToCart, onBuyNow }) {
  const [selectedImage, setSelectedImage] = useState(() => {
    const mainImg = getProductImage(product)
    return mainImg
  })
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState([])
  const formatVnd = (v) => (v || 0).toLocaleString('vi-VN') + '₫'

  const images = useMemo(() => {
    let imgs = product.images
    if (typeof imgs === 'string' && imgs.startsWith('[')) {
      try { imgs = JSON.parse(imgs) } catch (e) {}
    }
    if (Array.isArray(imgs) && imgs.length > 0) return imgs
    return [product.image_url || '/images/products/cat-litter-2.webp']
  }, [product])

  useEffect(() => {
    fetchReviews(product.id).then(setReviews).catch(() => {})
  }, [product.id])

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) 
    : (product.rating || 5)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-surface w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col md:flex-row animate-in zoom-in slide-in-from-bottom-10 duration-500 border border-white/20">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-stone-400 hover:text-primary z-10 transition-all hover:rotate-90">
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Left: Gallery */}
        <div className="md:w-1/2 p-8 bg-white flex flex-col gap-4">
          <div className="flex-1 rounded-[2rem] overflow-hidden bg-stone-50 border border-stone-100 relative group">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 shrink-0">
            {images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary shadow-lg shadow-primary/10' : 'border-stone-100 opacity-60'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="thumb" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="md:w-1/2 p-10 flex flex-col overflow-y-auto">
          <div className="mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-teal-50 px-4 py-1.5 rounded-full mb-4 inline-block">{product.category}</span>
            <h2 className="text-3xl font-headline font-black tracking-tighter text-stone-800 mb-2 leading-none">{product.name}</h2>
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined text-[14px] text-amber-400 ${i < Math.floor(avgRating) ? 'fill-icon' : ''}`}>star</span>
              ))}
              <span className="text-[10px] font-black text-stone-300 ml-2">({reviews.length || product.reviews_count || 0} ĐÁNH GIÁ)</span>
            </div>
            <p className="text-stone-400 font-medium leading-relaxed mb-8 line-clamp-3">{product.summary || product.description}</p>
            <div className="text-3xl font-black text-primary mb-6">{formatVnd(product.price)}</div>
          </div>

          {/* Mini Reviews Preview */}
          {reviews.length > 0 && (
            <div className="mb-8 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Đánh giá gần đây</h4>
              {reviews.slice(0, 2).map(r => (
                <div key={r.id} className="flex items-start gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="w-8 h-8 rounded-full bg-teal-100 overflow-hidden shrink-0 flex items-center justify-center text-xs font-black text-teal-600">
                    {r.user_pic ? <img src={r.user_pic} className="w-full h-full object-cover" alt="" /> : r.user_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-700">{r.user_name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`material-symbols-outlined text-[10px] ${i < r.rating ? 'text-amber-400 fill-icon' : 'text-stone-200'}`}>star</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-400 font-medium line-clamp-1 mt-0.5">{r.comment}</p>
                  </div>
                </div>
              ))}
              {reviews.length > 2 && (
                <Link to={`/product/${product.id}`} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                  Xem tất cả {reviews.length} đánh giá →
                </Link>
              )}
            </div>
          )}

          <div className="mt-auto space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Số lượng</span>
              <div className="flex items-center bg-stone-50 rounded-2xl p-1 border border-stone-100">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-primary transition-all"><span className="material-symbols-outlined">remove</span></button>
                <span className="w-10 text-center font-black text-stone-800">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-primary transition-all"><span className="material-symbols-outlined">add</span></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { onAddToCart({ ...product, quantity }); onClose(); }}
                className="flex items-center justify-center gap-2 bg-white text-primary font-black py-4 rounded-[1.5rem] border-2 border-primary/10 hover:bg-teal-50 transition-all uppercase text-[10px] tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">shopping_cart</span> Thêm giỏ
              </button>
              <button 
                onClick={() => onBuyNow(product, quantity)}
                className="flex items-center justify-center gap-2 bg-primary text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-primary/20 hover:brightness-110 transition-all uppercase text-[10px] tracking-widest"
              >
                Mua ngay
              </button>
            </div>
            
            <Link to={`/product/${product.id}`} className="block text-center text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 hover:text-primary transition-colors">
              Xem chi tiết đầy đủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
