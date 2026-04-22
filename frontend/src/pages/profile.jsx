import { useState, useEffect } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { fetchOrders } from '../api'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, loading, logout } = useAuth()
  
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (user && !loading) {
      const loadOrders = async () => {
        try {
          const data = await fetchOrders()
          setOrders(data)
        } catch (error) {
          console.error("Failed to fetch orders:", error)
        } finally {
          setLoadingOrders(false)
        }
      }
      loadOrders()
    }
  }, [user, loading])

  const handleCancelSubscription = (uniqueKey) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy gói dịch vụ này không?')) return
    
    const activeSubs = JSON.parse(localStorage.getItem('pett_active_subscriptions') || '[]')
    const filtered = activeSubs.filter(s => s.uniqueKey !== uniqueKey)
    localStorage.setItem('pett_active_subscriptions', JSON.stringify(filtered))
    // Force a re-render
    window.location.reload()
  }

  const getParsedItems = (items) => {
    if (!items) return []
    if (typeof items === 'string') {
      try { return JSON.parse(items) } catch (e) { return [] }
    }
    return Array.isArray(items) ? items : []
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] bg-[#f6f6f7] px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-500">
          Đang tải thông tin tài khoản...
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#f6f6f7] px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Info */}
        <section className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative">
              <img
                src={user.profile_pic || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                alt={user.full_name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <span className="material-symbols-outlined text-sm">verified</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{user.full_name}</p>
              <p className="text-slate-500 font-medium">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-teal-100">
                  {user.subscription_tier === 'vip' ? 'Thành viên VIP (Giảm 15%)' : 
                   user.subscription_tier === 'pro' ? 'Thành viên PRO (Giảm 10%)' :
                   user.subscription_tier === 'basic' ? 'Thành viên BASIC' : 'Khách hàng Thân thiết'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center px-8 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all active:scale-95"
          >
            Đăng xuất
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subscriptions Section */}
          <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600">calendar_today</span>
                Gói định kỳ
              </h2>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">Đang hoạt động</span>
            </div>

            {(() => {
              const activeSubs = JSON.parse(localStorage.getItem('pett_active_subscriptions') || '[]')
              if (activeSubs.length === 0) {
                return (
                  <div className="text-center py-12 px-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                    <span className="material-symbols-outlined text-slate-200 text-5xl mb-4">rebase_edit</span>
                    <p className="text-slate-400 font-medium italic">Bạn chưa đăng ký gói định kỳ nào.</p>
                  </div>
                )
              }

              return (
                <div className="space-y-4">
                  {activeSubs.map((sub, idx) => (
                    <div key={sub.uniqueKey || idx} className="p-5 bg-teal-900 text-white rounded-[2rem] shadow-xl shadow-teal-900/10 relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-black tracking-tight">{sub.name}</h3>
                            <p className="text-xs text-white/60 font-medium">Bắt đầu: {sub.startDate}</p>
                          </div>
                          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <span className="material-symbols-outlined text-white">loyalty</span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between mt-4">
                          <p className="text-sm font-medium text-white/80 grow pr-4">{sub.description}</p>
                          <div className="flex flex-col items-end gap-2">
                             <div className="px-3 py-1 bg-white text-teal-900 text-[10px] font-black rounded-full uppercase">MoMo</div>
                             <button 
                               onClick={() => handleCancelSubscription(sub.uniqueKey)}
                               className="text-[10px] font-bold text-white/40 hover:text-white transition-colors underline underline-offset-4"
                             >
                               Hủy gói
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </section>

          {/* Recent Orders Section */}
          <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600">receipt_long</span>
                Đơn hàng gần đây
              </h2>
            </div>

            {loadingOrders ? (
              <div className="text-center py-12 px-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                <span className="material-symbols-outlined text-slate-200 text-5xl mb-4 animate-spin">sync</span>
                <p className="text-slate-400 font-medium italic">Đang tải lịch sử đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 px-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                <span className="material-symbols-outlined text-slate-200 text-5xl mb-4">shopping_basket</span>
                <p className="text-slate-400 font-medium italic">Chưa có lịch sử đơn hàng.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Mã đơn hàng</p>
                        <p className="font-bold text-slate-900">{order.order_code}</p>
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                        order.status === 'completed' ? 'bg-teal-600 text-white' : 
                        order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {order.status === 'completed' ? 'Hoàn tất' : 
                         order.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
                      </span>
                    </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <div className="flex flex-col">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-slate-500">
                              {getParsedItems(order.items).reduce((sum, item) => sum + (item.quantity || 1), 0)} sản phẩm
                            </span>
                            <span className="text-lg font-black text-slate-900 ml-4">
                              {Number(order.total_amount).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {order.payment_method === 'momo' ? 'Thanh toán MoMo' : 'Thanh toán khi nhận hàng (COD)'}
                          </p>
                        </div>
                        <Link 
                          to={`/order-tracking/${order.id}`}
                          className="flex items-center gap-1 text-xs font-black text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest bg-teal-50 px-4 py-2 rounded-xl"
                        >
                          Chi tiết <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
