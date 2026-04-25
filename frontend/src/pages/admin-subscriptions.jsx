import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../api'

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('pett_token')}`,
    'Content-Type': 'application/json'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/users`, { headers: headers() }),
          fetch(`${API_BASE_URL}/admin/products`, { headers: headers() })
        ])
        
        if (usersRes.ok) setUsers(await usersRes.json())
        if (productsRes.ok) {
          const allProducts = await productsRes.json()
          setPlans(allProducts.filter(p => p.category === 'subscription' || p.id.startsWith('plan-')))
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'
  const formatVnd = (v) => (v || 0).toLocaleString('vi-VN') + '₫'

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-stone-400 font-bold animate-pulse uppercase tracking-widest">Đang tải...</span></div>

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">Gói định kỳ & Thành viên</h1>
          <p className="text-stone-400 font-medium mt-1">Quản lý các gói dịch vụ và cấp độ hội viên</p>
        </div>
      </div>

      {/* Subscription Plans Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-stone-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-600">loyalty</span>
          Các gói dịch vụ hiện có
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const iconMap = {
              'plan-basic': { icon: 'potted_plant', color: 'text-blue-500', bg: 'bg-blue-50' },
              'plan-pro': { icon: 'military_tech', color: 'text-purple-500', bg: 'bg-purple-50' },
              'plan-vip': { icon: 'workspace_premium', color: 'text-amber-500', bg: 'bg-amber-50' }
            }
            const style = iconMap[plan.id] || { icon: 'loyalty', color: 'text-teal-500', bg: 'bg-teal-50' }
            
            return (
              <div key={plan.id} className="bg-white p-8 rounded-[3rem] border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 ${style.bg} rounded-2xl flex items-center justify-center border border-stone-100`}>
                    <span className={`material-symbols-outlined text-2xl ${style.color}`}>{style.icon}</span>
                  </div>
                  <span className="px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-black rounded-full uppercase tracking-widest">Đang bán</span>
                </div>
                <h3 className="text-xl font-black text-stone-800 mb-1">{plan.name}</h3>
                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-4">{plan.id}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-black text-teal-600">{formatVnd(plan.price)}</span>
                <span className="text-[10px] font-bold text-stone-400 uppercase">/ tháng</span>
              </div>
              <button className="w-full py-3 bg-stone-50 text-stone-400 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all">
                Chỉnh sửa gói
              </button>
              </div>
            )
          })}
          {plans.length === 0 && (
            <div className="col-span-3 p-12 text-center bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200 text-stone-400 font-bold uppercase tracking-widest">
              Chưa có gói định kỳ nào được thiết lập
            </div>
          )}
        </div>
      </section>

      {/* Users Table Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-stone-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-600">group</span>
          Danh sách thành viên ({users.length})
        </h2>
        <div className="bg-white rounded-[3rem] border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Thành viên</th>
                  <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Email</th>
                  <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Cấp độ</th>
                  <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-stone-100 rounded-2xl overflow-hidden shrink-0 border border-stone-200">
                          {u.profile_pic ? (
                            <img src={u.profile_pic} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-stone-400">
                              {u.full_name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-sm text-stone-800">{u.full_name}</p>
                          <p className="text-[10px] font-black text-stone-300">ID: #{u.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-sm text-stone-400 font-bold">{u.email}</td>
                    <td className="p-8">
                      <span className={`px-4 py-2 text-[10px] font-black rounded-full uppercase tracking-widest ${
                        u.subscription_tier === 'vip' ? 'bg-amber-100 text-amber-700' : 
                        u.subscription_tier === 'pro' ? 'bg-purple-100 text-purple-700' :
                        u.subscription_tier === 'basic' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-500'
                      }`}>{u.subscription_tier || 'Free'}</span>
                    </td>
                    <td className="p-8 text-xs font-bold text-stone-400">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
