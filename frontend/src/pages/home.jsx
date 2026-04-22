import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  // Animation observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .count-up').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-surface">
      {/* Hero Section */}
      <section className="relative w-full min-h-[calc(100vh-var(--nav-h,80px))] flex items-center px-6 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-[#002820] z-0">
          <div className="absolute inset-0 opacity-40" 
            style={{
              background: 'radial-gradient(120% 90% at 82% 15%, rgba(20,184,166,0.5) 0%, transparent 48%), linear-gradient(140deg, #002820 0%, #004438 38%, #006b5f 72%, #0b7f72 100%)'
            }}
          ></div>
          {/* Grain overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px',
              mixBlendMode: 'overlay'
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 py-20">
          {/* Left: Copy */}
          <div className="lg:col-span-7 reveal-left" style={{'--delay': '60ms'}}>
            <h1 className="font-headline font-black text-white leading-[0.95] tracking-tighter mb-8"
              style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}>
              Chăm sóc<br/>
              <span className="text-primary-fixed italic">trọn vẹn</span><br/>
              cho người bạn nhỏ.
            </h1>
            <p className="text-teal-50/80 mb-10 max-w-xl text-lg font-medium leading-relaxed">
              PETT mang đến dinh dưỡng khoa học, phụ kiện tinh tế và sự yêu thương chân thành đến cho mọi thú cưng trong gia đình bạn.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/shop" className="inline-flex items-center gap-3 bg-white text-primary px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs transition-all hover:scale-105 hover:shadow-2xl shadow-primary/20">
                Khám phá cửa hàng
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <Link to="/blog" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs transition-all hover:bg-white/20">
                Đọc Blog PETT
              </Link>
            </div>
            {/* Quick trust bar */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-teal-50/60">
              <span className="bg-white/10 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                <span className="text-tertiary-fixed">★★★★★</span>
                4.9/5 RATING
              </span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span>5.000+ Khách hàng</span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span>98% Hài lòng</span>
            </div>
          </div>

          {/* Right: Product Bag */}
          <div className="lg:col-span-5 flex justify-center items-center reveal-right mt-10 lg:mt-0 relative" style={{'--delay': '140ms'}}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-400/20 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
            <img src="/images/pett-bag.webp" alt="PETT Bag" 
              className="relative z-10 w-full max-w-[500px] object-contain drop-shadow-[0_50px_80px_rgba(0,0,0,0.6)] hover:-translate-y-6 transition-transform duration-1000 ease-out" 
            />
          </div>
        </div>

        {/* Marquee Strip */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur-md py-4 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2].map(i => (
              <div key={i} className="flex shrink-0">
                <MarqueeItem icon="pets" text="Dinh dưỡng khoa học" />
                <MarqueeItem icon="local_shipping" text="Giao nhanh 2 giờ" />
                <MarqueeItem icon="cruelty_free" text="Không thử nghiệm động vật" />
                <MarqueeItem icon="workspace_premium" text="Bác sĩ thú y tư vấn" />
                <MarqueeItem icon="favorite" text="Sức khỏe toàn diện" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section with Video */}
      <section className="relative min-h-[80vh] flex flex-col justify-center px-6 overflow-hidden group">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/bento-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#003c35]/70 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 py-32">
          <div className="max-w-2xl reveal-up">
            <h2 className="text-white font-headline font-black leading-[0.95] tracking-tighter mb-8"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
              100% Cân Bằng <br/><span className="text-primary-fixed">Dinh Dưỡng</span>
            </h2>
            <p className="text-white/80 text-xl font-medium leading-relaxed mb-12 max-w-lg">
              Công thức khoa học được kiểm duyệt bởi bác sĩ thú y — không chất bảo quản, không phụ gia nhân tạo.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-3 bg-white text-primary px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-2xl shadow-black/40">
              Xem sản phẩm
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-on-background py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24 reveal-up">
            <span className="inline-block text-primary-fixed font-black text-xs tracking-[0.3em] uppercase mb-6">Minh chứng thực tế</span>
            <h2 className="font-headline font-black text-white leading-none tracking-tighter"
              style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)' }}>
              Con số nói lên <span className="text-primary-fixed">tất cả.</span>
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-32 border border-white/5 bg-white/[0.02] rounded-[4rem] backdrop-blur overflow-hidden reveal-up">
            <StatItem count={4.9} label="Đánh giá trung bình" suffix="/5" decimals={1} icon="star" />
            <StatItem count={5000} label="Hộ gia đình tin dùng" suffix="+" icon="groups" />
            <StatItem count={98} label="Khách hàng hài lòng" suffix="%" icon="sentiment_very_satisfied" />
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Chị Lan" 
              role="Hà Nội · Nuôi 1 bé Corgi" 
              text="PETT thay đổi hoàn toàn thói quen ăn uống của Corgi nhà mình. Lông bóng, năng lượng dồi dào — từ ngày đổi sang PETT, bé không còn lười ăn nữa!"
              initials="LN"
              color="bg-primary"
              delay="100ms"
            />
            <TestimonialCard 
              name="Anh Minh" 
              role="TP.HCM · Nuôi 2 bé Mèo" 
              text="Giao hàng cực nhanh, đóng gói đẹp mắt, mèo nhà tôi ghiền luôn! Tôi đã dùng thử rất nhiều thương hiệu nhưng PETT là cái tôi trung thành nhất."
              initials="AM"
              color="bg-teal-600"
              featured
              delay="200ms"
            />
            <TestimonialCard 
              name="Bé Na" 
              role="Đà Nẵng · Khách hàng 2 năm" 
              text="Tư vấn nhiệt tình, có kiến thức chuyên môn sâu. Mình được hướng dẫn đổi hạt cho bé mèo đang bị nấm da, kết quả phục hồi rất tốt sau 3 tuần!"
              initials="NA"
              color="bg-amber-600"
              delay="300ms"
            />
          </div>

          <div className="text-center mt-24 reveal-up">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Tham gia cộng đồng PETT Squad</p>
            <Link to="/goi-dinh-ky" className="inline-flex items-center gap-3 bg-primary text-white px-12 py-6 rounded-full font-black uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-2xl shadow-primary/40">
              Đăng ký Gói Định Kỳ
              <span className="material-symbols-outlined text-base">star</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function MarqueeItem({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-3 px-12 text-teal-50/80 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
      <span className="material-symbols-outlined text-sm text-primary-fixed">{icon}</span>
      {text}
    </span>
  )
}

function StatItem({ count, label, suffix = '', decimals = 0, icon }) {
  const [displayCount, setDisplayCount] = useState(0)
  const ref = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0
        const duration = 2000
        const startTime = performance.now()

        const update = (now) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 4) // easeOutQuart
          setDisplayCount(eased * count)
          if (progress < 1) requestAnimationFrame(update)
        }
        requestAnimationFrame(update)
        observer.disconnect()
      }
    }, { threshold: 0.5 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [count])

  return (
    <div ref={ref} className="flex flex-col items-center py-16 px-8 border-white/5 md:[&:not(:last-child)]:border-r [&:not(:last-child)]:border-b md:[&:not(:last-child)]:border-b-0">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-primary-fixed">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="font-headline font-black text-white text-6xl">
          {displayCount.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        </span>
        <span className="text-primary-fixed font-black text-2xl">{suffix}</span>
      </div>
      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest text-center">{label}</p>
    </div>
  )
}

function TestimonialCard({ name, role, text, initials, color, featured, delay }) {
  return (
    <div className={`reveal-up group ${featured ? 'md:-mt-8' : ''}`} style={{'--delay': delay}}>
      <div className={`h-full bg-white/[0.03] backdrop-blur-sm p-10 rounded-[3rem] border transition-all duration-500 hover:-translate-y-4 ${
        featured ? 'border-primary/30 bg-primary/10 shadow-2xl shadow-primary/20 scale-105 z-10' : 'border-white/5 hover:bg-white/[0.06]'
      }`}>
        <div className="flex text-amber-400 mb-8">
          {[...Array(5)].map((_, i) => <span key={i} className="material-symbols-outlined text-[16px] fill-icon">star</span>)}
        </div>
        <p className="text-white/80 text-lg font-medium leading-relaxed italic mb-10">"{text}"</p>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white ${color} shadow-lg shadow-black/20`}>
            {initials}
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none mb-1">{name}</p>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
