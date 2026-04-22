import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchBlog, fetchBlogs } from '../api'

export default function BlogDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [blogData, allBlogs] = await Promise.all([
          fetchBlog(id),
          fetchBlogs()
        ])
        setBlog(blogData)
        setRelated(allBlogs.filter(b => b.id !== id && b.category === blogData.category).slice(0, 3))
      } catch (e) {
        console.error('Failed to fetch blog:', e)
        navigate('/blog')
      } finally {
        setLoading(false)
      }
    }
    load()
    window.scrollTo(0, 0)
  }, [id, navigate])

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setScrollProgress(scrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!blog) return null

  return (
    <div className="bg-surface min-h-screen">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-stone-100">
        <div 
          className="h-full bg-primary transition-all duration-100" 
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Hero Header */}
      <header className="relative h-[70vh] min-h-[500px] flex items-end pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={blog.image_url || '/images/blog-dog-food.png'} 
            className="w-full h-full object-cover" 
            alt={blog.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
        </div>
        
        <div className="max-w-4xl mx-auto w-full relative z-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 text-[10px] font-black uppercase tracking-widest group">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Trở lại Blog
          </Link>
          <div className="flex items-center gap-4 text-primary-fixed font-black text-[10px] uppercase tracking-widest mb-6">
            <span className="bg-primary-fixed/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full">{blog.category}</span>
            <span className="text-white/60">8 PHÚT ĐỌC</span>
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-headline font-black text-white leading-[0.95] tracking-tighter mb-8 animate-in slide-in-from-bottom duration-700">
            {blog.title}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center font-black text-white border border-white/20">
                {blog.author?.[0] || 'P'}
              </div>
              <div>
                <p className="text-sm font-black text-white">{blog.author || 'PETT Editor'}</p>
                <p className="text-[10px] font-bold text-white/40 uppercase">Tháng 5, 2024</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all">
                 <span className="material-symbols-outlined text-sm">share</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all">
                 <span className="material-symbols-outlined text-sm">bookmark</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-20">
        <div className="prose prose-stone prose-lg max-w-none 
          prose-headings:font-headline prose-headings:font-black prose-headings:tracking-tighter
          prose-p:text-stone-600 prose-p:leading-relaxed prose-p:font-medium
          prose-strong:text-stone-800 prose-strong:font-black
          prose-img:rounded-[2.5rem] prose-img:shadow-2xl
          prose-blockquote:border-l-primary prose-blockquote:bg-teal-50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:not-italic prose-blockquote:text-stone-700 prose-blockquote:font-black
        ">
          {/* Summary/Intro */}
          <p className="text-2xl font-black text-stone-800 leading-snug mb-12 italic">
            {blog.summary}
          </p>

          {/* Body Content */}
          <div dangerouslySetInnerHTML={{ __html: blog.content }} className="blog-content-body" />
        </div>

        {/* Footer info */}
        <div className="mt-20 pt-10 border-t border-stone-100 flex flex-wrap justify-between items-center gap-8">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Chia sẻ:</span>
              <div className="flex gap-2">
                 {['facebook', 'twitter', 'linkedin'].map(s => (
                   <button key={s} className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 hover:bg-primary hover:text-white transition-all">
                      <i className={`fab fa-${s}`}></i>
                      <span className="material-symbols-outlined text-sm">{s === 'facebook' ? 'public' : 'share'}</span>
                   </button>
                 ))}
              </div>
           </div>
           <div className="flex flex-wrap gap-2">
              {['Dinh dưỡng', 'Sức khỏe', 'Mẹo hay'].map(tag => (
                <span key={tag} className="px-4 py-1.5 bg-stone-50 text-stone-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-stone-100">
                  #{tag.replace(' ', '')}
                </span>
              ))}
           </div>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="bg-stone-50 py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">Khám phá thêm</span>
                <h2 className="text-4xl font-headline font-black text-stone-800 tracking-tighter">Bài viết liên quan</h2>
              </div>
              <Link to="/blog" className="text-stone-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
                Tất cả bài viết <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((b) => (
                <Link key={b.id} to={`/blog/${b.id}`} className="group block bg-white p-4 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-stone-50 mb-6">
                    <img src={b.image_url || '/images/blog-dog-food.png'} alt={b.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </div>
                  <div className="px-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 block">{b.category}</span>
                    <h3 className="text-xl font-headline font-black text-stone-800 tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {b.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter / CTA */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="bg-primary rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-headline font-black text-white tracking-tighter leading-[0.95] mb-8">
              Nhận mẹo hay cho boss mỗi tuần!
            </h2>
            <p className="text-white/70 text-xl font-medium mb-12">
              Tham gia cùng 5.000+ chủ nuôi khác nhận bản tin dinh dưỡng và ưu đãi độc quyền từ PETT.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                className="flex-1 px-8 py-5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-4 focus:ring-white/10 focus:bg-white/20 transition-all font-medium"
              />
              <button className="px-10 py-5 bg-white text-primary rounded-full font-black uppercase tracking-widest shadow-2xl shadow-black/20 hover:scale-105 transition-all">
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
