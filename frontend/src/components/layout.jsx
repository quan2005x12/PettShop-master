import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useCart } from '../context/cartContext'

const navItems = [
  { label: 'Cửa hàng', to: '/shop' },
  { label: 'Blog', to: '/blog' },
  { label: 'Gói định kỳ', to: '/goi-dinh-ky' },
]

import { useAuth } from '../context/authContext'

function AppHeader() {
  const { getTotalItems } = useCart()
  const cartCount = getTotalItems()
  const { user } = useAuth()

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-container-high/50">
      <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <NavLink
          to="/"
          className="text-3xl font-black tracking-tighter text-primary font-headline uppercase hover:scale-[1.02] transition-transform"
        >
          PETT
        </NavLink>
        
        <div className="hidden md:flex items-center gap-2 font-label text-sm font-bold">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-5 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-on-surface hover:bg-surface-container-high'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/cart"
            className="p-2.5 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all active:scale-90 relative group"
            aria-label="Giỏ hàng"
          >
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-secondary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-md border-2 border-surface animate-in zoom-in duration-300">
                {cartCount}
              </span>
            )}
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className="p-2.5 text-teal-600 hover:bg-teal-50 rounded-full transition-all active:scale-90"
              aria-label="Quản trị"
            >
              <span className="material-symbols-outlined text-[24px]">dashboard_customize</span>
            </NavLink>
          )}
          
          <NavLink
            to={user ? "/profile" : "/login"}
            state={{ from: { pathname: '/profile' } }}
            className="p-2.5 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all active:scale-90"
            aria-label="Tài khoản"
          >
            <span className="material-symbols-outlined text-[24px]">person</span>
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

function AppFooter() {
  return (
    <footer className="bg-surface-container-lowest w-full mt-20 border-t border-surface-container">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 border-b border-surface-container pb-12">
          
          <div className="flex flex-col items-center md:items-start max-w-sm text-center md:text-left">
            <NavLink to="/" className="text-4xl font-black text-primary font-headline uppercase mb-4 tracking-tighter">PETT</NavLink>
            <p className="text-sm font-medium text-stone-500 leading-relaxed mb-6">Chăm sóc toàn diện cho thú cưng của bạn bằng tình yêu, kinh nghiệm và sự thấu hiểu chuyên sâu nhất.</p>
            <div className="flex gap-3">
              <a href="mailto:contact@pett.com" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all shadow-sm group">
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">mail</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all shadow-sm group">
                 <span className="font-bold text-sm">fb</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-[#E1306C] hover:text-white transition-all shadow-sm group">
                 <span className="font-bold text-sm">ig</span>
              </a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-12 md:gap-24 text-center sm:text-left">
             <div className="flex flex-col gap-5">
                <h4 className="font-black text-stone-800 uppercase tracking-widest text-[11px] mb-2">Khám phá</h4>
                <Link className="text-sm text-stone-500 hover:text-teal-600 transition-colors font-bold" to="/shop">Cửa hàng</Link>
                <Link className="text-sm text-stone-500 hover:text-teal-600 transition-colors font-bold" to="/blog">Blog thú cưng</Link>
                <Link className="text-sm text-stone-500 hover:text-teal-600 transition-colors font-bold" to="/goi-dinh-ky">Gói định kỳ</Link>
             </div>
             <div className="flex flex-col gap-5">
                <h4 className="font-black text-stone-800 uppercase tracking-widest text-[11px] mb-2">Hỗ trợ</h4>
                <Link className="text-sm text-stone-500 hover:text-teal-600 transition-colors font-bold" to="/privacy-policy">Chính sách bảo mật</Link>
                <Link className="text-sm text-stone-500 hover:text-teal-600 transition-colors font-bold" to="/terms-of-service">Điều khoản dịch vụ</Link>
                <Link className="text-sm text-stone-500 hover:text-teal-600 transition-colors font-bold" to="/contact">Liên hệ chúng tôi</Link>
             </div>
          </div>

        </div>
        
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-black text-stone-400 tracking-widest uppercase">
          <p>© 2024 PETT Shop. Bản quyền thuộc về PETT.</p>
          <p>Thiết kế với ♥ dành cho thú cưng.</p>
        </div>
      </div>
    </footer>
  )
}

export default function Layout({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Removed Blog and Checkout pages from isStitchScreen to use React native layout
  const isStitchScreen =
    pathname === '/goi-dinh-ky'

  if (isStitchScreen) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader />
      <main className="pt-[var(--shop-nav-height)]">{children}</main>
      <AppFooter />
    </div>
  )
}


