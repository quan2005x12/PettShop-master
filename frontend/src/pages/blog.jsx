import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchBlogs } from '../api'

export default function BlogPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBlogs()
        setBlogs(data)
      } catch (e) {
        console.error('Failed to fetch blogs:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = ['All', ...new Set(blogs.map(b => b.category))]

  const filteredBlogs = activeCategory === 'All' 
    ? blogs 
    : blogs.filter(b => b.category === activeCategory)

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
  }, [filteredBlogs, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const featuredBlog = blogs[0]
  const otherBlogs = filteredBlogs.filter(b => b.id !== featuredBlog?.id)

  return (
    <div className="bg-surface min-h-screen pb-32">
      {/* Hero Section */}
      <section className="relative bg-[#003c35] text-white py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h40v40H40V0zM0 40h40v40H0V40z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px'
        }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 split-reveal-left">
            Tạp chí thú cưng hiện đại
          </span>
          <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-headline font-black tracking-tighter leading-[0.95] mb-8 reveal-up">
            Kiến thức & <span className="text-primary-fixed italic">Yêu thương</span>
          </h1>
          <p className="text-teal-50/70 text-xl font-medium max-w-2xl mx-auto mb-12 reveal-up" style={{'--delay': '100ms'}}>
            Mọi điều bạn cần để trở thành "sen" tâm lý và chăm sóc boss một cách khoa học nhất.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 reveal-up" style={{'--delay': '200ms'}}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-white text-primary shadow-xl' 
                    : 'bg-white/5 border border-white/10 text-teal-50 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredBlog && activeCategory === 'All' && (
        <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
          <Link to={`/blog/${featuredBlog.id}`} className="group block">
            <div className="bg-white rounded-[3rem] p-4 shadow-2xl shadow-stone-200/50 flex flex-col lg:flex-row gap-12 overflow-hidden border border-stone-100 transition-all duration-700 hover:shadow-stone-300/60 hover:-translate-y-2">
              <div className="lg:w-1/2 aspect-[16/9] lg:aspect-auto rounded-[2.5rem] overflow-hidden bg-stone-50">
                <img 
                  src={featuredBlog.image_url || '/images/blog-dog-food.png'} 
                  alt={featuredBlog.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
              </div>
              <div className="lg:w-1/2 flex flex-col justify-center p-8 lg:p-12">
                <div className="flex items-center gap-4 text-[10px] font-black text-primary uppercase tracking-widest mb-6">
                  <span className="px-3 py-1 bg-teal-50 rounded-full">{featuredBlog.category}</span>
                  <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
                  <span className="text-stone-400">8 PHÚT ĐỌC</span>
                </div>
                <h2 className="text-4xl font-headline font-black text-stone-800 tracking-tighter mb-6 leading-[1.1] group-hover:text-primary transition-colors">
                  {featuredBlog.title}
                </h2>
                <p className="text-lg text-stone-400 font-medium leading-relaxed mb-10 line-clamp-3">
                  {featuredBlog.summary}
                </p>
                <div className="mt-auto flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center font-black text-stone-400">
                    {featuredBlog.author?.[0] || 'P'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-stone-800">{featuredBlog.author || 'PETT Editor'}</p>
                    <p className="text-[10px] font-bold text-stone-300 uppercase">2 ngày trước</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Grid Posts */}
      <section className="max-w-7xl mx-auto px-6 mt-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {otherBlogs.map((blog, idx) => (
            <BlogCard key={blog.id} blog={blog} index={idx} />
          ))}
        </div>
      </section>
    </div>
  )
}

function BlogCard({ blog, index }) {
  return (
    <div className="reveal-up group" style={{'--delay': `${index * 50}ms`}}>
      <Link to={`/blog/${blog.id}`} className="block">
        <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-stone-50 mb-8 border border-stone-100 shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2">
          <img 
            src={blog.image_url || '/images/products/salmon-bites-1.webp'} 
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
          <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
            {blog.category}
          </div>
        </div>
        <div className="px-2">
          <h3 className="text-2xl font-headline font-black text-stone-800 tracking-tighter leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-stone-400 font-medium line-clamp-2 mb-6">
            {blog.summary}
          </p>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-stone-50 rounded-xl flex items-center justify-center text-[10px] font-black text-stone-300 border border-stone-100">
                 {blog.author?.[0] || 'P'}
               </div>
               <span className="text-[10px] font-black text-stone-800 uppercase tracking-widest">{blog.author || 'PETT'}</span>
             </div>
             <span className="text-[10px] font-bold text-stone-300 uppercase">May 2024</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
