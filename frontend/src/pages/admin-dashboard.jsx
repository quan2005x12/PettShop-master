import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { API_BASE_URL } from '../api'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeSubs: 0,
    totalUsers: 0
  })
  const [chartData, setChartData] = useState([])
  const [chartPeriod, setChartPeriod] = useState('week')
  const [recentOrders, setRecentOrders] = useState([])
  const [serviceStatus, setServiceStatus] = useState({ backend: 'checking', db: 'checking' })

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('pett_token')
        const headers = { 'Authorization': `Bearer ${token}` }


        const [statsRes, chartRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/stats`, { headers }),
          fetch(`${API_BASE_URL}/admin/sales-chart`, { headers }),
          fetch(`${API_BASE_URL}/admin/recent-orders`, { headers })
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats({
            totalRevenue: data.total_revenue,
            totalOrders: data.total_orders,
            activeSubs: data.active_subscriptions,
            totalUsers: data.total_users
          })
        }

        if (chartRes.ok) {
          const data = await chartRes.json()
          setChartData(data.daily_sales)
        }

        try {
          const healthRes = await fetch(`${API_BASE_URL}/health`)
          if (healthRes.ok) {
            const hData = await healthRes.json()
            setServiceStatus({ backend: hData.status, db: hData.database })
          } else {
            setServiceStatus({ backend: 'error', db: 'error' })
          }
        } catch(e) {
          setServiceStatus({ backend: 'error', db: 'error' })
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json()
          setRecentOrders(data)
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
      }
    }

    fetchAdminData()
  }, [])

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem('pett_token')

        const res = await fetch(`${API_BASE_URL}/admin/sales-chart?period=${chartPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setChartData(data.daily_sales)
        }
      } catch (e) {
        console.error('Failed to fetch chart:', e)
      }
    }
    fetchChartData()
  }, [chartPeriod])

  const formatVnd = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0₫'
    return val.toLocaleString('vi-VN') + '₫'
  }

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">Thống kê doanh số</h1>
        <p className="text-on-surface-variant font-medium mt-2">Báo cáo cập nhật theo thời gian thực — <span className="text-primary font-black">{new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tổng doanh thu', value: formatVnd(stats.totalRevenue), icon: 'attach_money', color: 'bg-teal-600' },
          { label: 'Đơn hàng', value: stats.totalOrders, icon: 'shopping_bag', color: 'bg-[#ff947d]' },
          { label: 'Gói định kỳ', value: stats.activeSubs, icon: 'loyalty', color: 'bg-teal-400' },
          { label: 'Khách hàng', value: stats.totalUsers, icon: 'group', color: 'bg-orange-400' }
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-surface-container shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-inherit/20`}>
              <span className="material-symbols-outlined text-2xl">{card.icon}</span>
            </div>
            <p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.15em] mb-1">{card.label}</p>
            <h3 className="text-2xl font-black text-on-surface tracking-tight">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full min-h-[300px]" style={{ background: '#fff', border: '1px solid #e7e5e4' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black" style={{ color: '#1c1917' }}>Biểu đồ tăng trưởng</h2>
            <div className="flex gap-2">
               <button 
                 onClick={() => setChartPeriod('week')}
                 className={`px-4 py-2 text-[10px] font-black rounded-full uppercase tracking-widest transition-colors ${chartPeriod === 'week' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
               >Tuần</button>
               <button 
                 onClick={() => setChartPeriod('month')}
                 className={`px-4 py-2 text-[10px] font-black rounded-full uppercase tracking-widest transition-colors ${chartPeriod === 'month' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
               >Tháng</button>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-[14px] pb-[10px]">
            {(() => {
              const data = Array.isArray(chartData) && chartData.length > 0 ? chartData : [{date: '', amount: 0}];
              
              // Logic xử lý dữ liệu: Tìm giá trị lớn nhất để tính tỷ lệ phần trăm động
              const values = data.map(d => d.amount);
              const maxValue = Math.max(...values, 1000000); // Tối thiểu là 1tr để biểu đồ không bị quá cao khi ít dữ liệu
              
              return data.map((item, i) => {
                const amount = item.amount;
                const percentage = (amount / maxValue) * 85; // Giới hạn tối đa 85% chiều cao để không chạm đỉnh
                const label = formatVnd(amount);
                
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                      {/* Cột dữ liệu */}
                      <div className="group relative w-full" style={{ height: `${Math.max(percentage, 5)}%` }}>
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(to top, #0d9488, #2dd4bf)',
                          borderRadius: '8px 8px 4px 4px',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.15)'
                        }} className="group-hover:brightness-110 group-hover:shadow-teal-500/30" />
                        
                        {/* Tooltip khi hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20">
                          {label}
                        </div>
                      </div>
                    </div>
                    {/* Nhãn ngày */}
                    <p style={{ 
                      textAlign: 'center', 
                      fontSize: '10px', 
                      fontWeight: 900, 
                      color: '#78716c', 
                      marginTop: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{item.date}</p>
                  </div>
                )
              })
            })()}
          </div>
        </div>

        {/* Quick Management */}
        <div className="space-y-6">
          <div className="bg-teal-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-teal-600/20 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            <h2 className="text-xl font-black mb-6 relative z-10">Quản lý nhanh</h2>
            <div className="grid grid-cols-2 gap-3 relative z-10">
               {[
                 { label: 'Sản phẩm', icon: 'add_box', path: '/admin/products' },
                 { label: 'Blog', icon: 'edit_note', path: '/admin/blogs' },
                 { label: 'Đơn hàng', icon: 'receipt_long', path: '/admin/orders' },
                 { label: 'Khách hàng', icon: 'person_search', path: '/admin' }
               ].map((btn, i) => (
                 <button 
                   key={i} 
                   onClick={() => navigate(btn.path)}
                   className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-2xl hover:bg-white hover:text-teal-600 transition-all duration-300"
                 >
                    <span className="material-symbols-outlined text-xl">{btn.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{btn.label}</span>
                 </button>
               ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
             <h2 className="text-lg font-black text-stone-800 mb-6">Trạng thái dịch vụ</h2>
             <div className="space-y-3">
                {[
                  { 
                    label: 'Hệ thống Backend', 
                    status: serviceStatus.backend === 'checking' ? 'Đang kiểm tra...' : serviceStatus.backend === 'ok' ? 'Hoạt động' : 'Gián đoạn',
                    ok: serviceStatus.backend === 'ok'
                  },
                  { 
                    label: 'Cơ sở dữ liệu', 
                    status: serviceStatus.db === 'checking' ? 'Đang kiểm tra...' : serviceStatus.db === 'ok' ? 'Ổn định' : 'Lỗi kết nối',
                    ok: serviceStatus.db === 'ok'
                  },
                  { 
                    label: 'Cổng thanh toán', 
                    status: 'Sẵn sàng',
                    ok: true 
                  }
                ].map((item, i) => (
                  <div key={i} className={`flex justify-between items-center p-4 rounded-2xl ${item.ok ? 'bg-teal-50' : 'bg-red-50'}`}>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${item.ok ? 'text-teal-700' : 'text-red-700'}`}>{item.label}</span>
                     <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${item.ok ? 'text-teal-500' : 'text-red-500'}`}>{item.status}</span>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${item.ok ? 'bg-teal-500' : 'bg-red-500'}`}></div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="p-8 rounded-[2.5rem] shadow-sm" style={{ background: '#fff', border: '1px solid #e7e5e4' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black" style={{ color: '#1c1917' }}>Đơn hàng gần đây</h2>
            <p className="text-xs font-bold text-stone-400 mt-1">Danh sách các giao dịch mới nhất</p>
          </div>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="px-5 py-2 text-[10px] font-black rounded-full uppercase tracking-widest border border-stone-200 hover:bg-stone-50 transition-all"
          >
            Xem tất cả
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid #f5f5f4' }}>
                <th className="pb-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Mã đơn</th>
                <th className="pb-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Khách hàng</th>
                <th className="pb-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Sản phẩm</th>
                <th className="pb-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Tổng tiền</th>
                <th className="pb-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="group">
                    <td className="py-5 font-black text-sm text-teal-600">#ORD-{order.id.toString().padStart(4, '0')}</td>
                    <td className="py-5">
                       <p className="font-black text-sm text-stone-800">{order.user_name}</p>
                       <p className="text-[10px] font-bold text-stone-400">{order.user_email}</p>
                    </td>
                    <td className="py-5 text-xs font-bold text-stone-500">
                      {order.status === 'completed' ? 'Giao dịch hoàn tất' : 'Đang xử lý...'}
                    </td>
                    <td className="py-5 font-black text-sm text-stone-800">{formatVnd(order.total_amount)}</td>
                    <td className="py-5">
                       <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${
                         order.status === 'completed' ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-600'
                       }`}>
                         {order.status === 'completed' ? 'Thành công' : order.status}
                       </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-sm font-bold text-stone-400">
                    Chưa có đơn hàng nào được ghi nhận
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
