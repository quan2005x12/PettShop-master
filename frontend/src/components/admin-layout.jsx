import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function AdminLayout({ children }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { label: 'Thống kê', icon: 'bar_chart', path: '/admin' },
    { label: 'Sản phẩm', icon: 'inventory_2', path: '/admin/products' },
    { label: 'Đơn hàng', icon: 'shopping_cart', path: '/admin/orders' },
    { label: 'Gói định kỳ', icon: 'rebase_edit', path: '/admin/subscriptions' },
    { label: 'Blog', icon: 'article', path: '/admin/blogs' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#fbfaee] font-body text-on-surface">
      {/* Sidebar */}
      <aside className="w-80 flex flex-col fixed h-full z-50 p-6">
        <div className="bg-white h-full rounded-[3rem] border border-surface-container shadow-sm flex flex-col overflow-hidden">
          <div className="p-10">
            <Link to="/admin" className="text-3xl font-headline font-black text-primary tracking-tighter uppercase">PETT</Link>
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mt-1">Hệ thống quản trị</p>
          </div>
          
          <nav className="flex-grow px-6 space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                  (item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path))
                    ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/20' 
                    : 'text-stone-500 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-8 border-t border-surface-container">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary text-xl">A</div>
              <div>
                <p className="text-sm font-black text-on-surface truncate">{user?.displayName || 'Administrator'}</p>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest">Admin</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow ml-80 p-6">
        <div className="min-h-[calc(100vh-3rem)] p-12">
          {children}
        </div>
      </main>
    </div>
  )
}
