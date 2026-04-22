import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../api'

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)


  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('pett_token')}`,
    'Content-Type': 'application/json'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: headers() })
        if (res.ok) setUsers(await res.json())
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-stone-400 font-bold animate-pulse uppercase tracking-widest">Đang tải...</span></div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-stone-800 tracking-tight">Quản lý Tài khoản</h1>
        <p className="text-stone-400 font-medium mt-1">Danh sách thành viên và quản trị viên hệ thống</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-stone-200 shadow-sm">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-teal-600">group</span>
          </div>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Tổng thành viên</p>
          <h3 className="text-4xl font-black text-stone-800">{users.length}</h3>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-stone-200 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-blue-600">person</span>
          </div>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Khách hàng</p>
          <h3 className="text-4xl font-black text-stone-800">{users.filter(u => u.role === 'customer').length}</h3>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-stone-200 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-amber-600">admin_panel_settings</span>
          </div>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Quản trị viên</p>
          <h3 className="text-4xl font-black text-stone-800">{users.filter(u => u.role === 'admin').length}</h3>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[3rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Mã số</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Thành viên</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Email</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Vai trò</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-teal-50/20 transition-colors">
                  <td className="p-8 font-black text-sm text-stone-300">#{u.id.toString().padStart(4, '0')}</td>
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
                      <p className="font-black text-sm text-stone-800">{u.full_name}</p>
                    </div>
                  </td>
                  <td className="p-8 text-sm text-stone-400 font-bold">{u.email}</td>
                  <td className="p-8">
                    <span className={`px-4 py-2 text-[10px] font-black rounded-full uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-teal-50 text-teal-600'
                    }`}>{u.role === 'admin' ? 'Quản trị' : 'Thành viên'}</span>
                  </td>
                  <td className="p-8 text-xs font-bold text-stone-400">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-20 text-center text-stone-400 font-bold uppercase tracking-widest">Hệ thống chưa có người dùng</div>
          )}
        </div>
      </div>
    </div>
  )
}
