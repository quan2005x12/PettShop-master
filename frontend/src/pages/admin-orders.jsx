import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../api'

const STATUS_MAP = {
  pending: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('pett_token')}`,
    'Content-Type': 'application/json'
  })

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders`, { headers: headers() })
      if (res.ok) setOrders(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) fetchOrders()
    } catch (e) { console.error(e) }
  }

  const formatVnd = (v) => (v || 0).toLocaleString('vi-VN') + '₫'
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-on-surface-variant font-bold animate-pulse">Đang tải...</span></div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-black text-on-surface tracking-tight">Quản lý Đơn hàng</h1>
          <p className="text-on-surface-variant font-medium mt-1">{orders.length} đơn hàng tổng cộng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending', label: 'Chờ xử lý' },
          { key: 'confirmed', label: 'Đã xác nhận' },
          { key: 'shipping', label: 'Đang giao' },
          { key: 'completed', label: 'Hoàn thành' },
          { key: 'cancelled', label: 'Đã hủy' }
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-5 py-2.5 text-[10px] font-black rounded-full uppercase tracking-widest transition-all ${
              filter === f.key ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'bg-white text-on-surface-variant border border-stone-200 hover:bg-teal-50'
            }`}>{f.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Mã đơn</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Khách hàng / Liên hệ</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Địa chỉ giao hàng</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Tổng tiền</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Ngày tạo</th>
                <th className="p-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((o) => (
                <tr key={o.id} className="group hover:bg-teal-50/30 transition-colors">
                  <td className="p-8">
                    <p className="font-black text-sm text-teal-600">#{o.order_code}</p>
                  </td>
                  <td className="p-8">
                    <p className="font-black text-sm text-stone-800">{o.customer_name}</p>
                    <p className="text-[10px] text-stone-400 font-bold">{o.customer_phone || o.customer_email}</p>
                  </td>
                  <td className="p-8">
                    <p className="text-xs font-medium text-stone-500 line-clamp-2 max-w-[200px]">{o.shipping_address || 'N/A'}</p>
                  </td>
                  <td className="p-8 text-right font-black text-sm text-stone-800">{formatVnd(o.total_amount)}</td>
                  <td className="p-8">
                    <span className="text-xs font-bold text-stone-400">{formatDate(o.created_at)}</span>
                  </td>
                  <td className="p-8">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600/10 ${STATUS_MAP[o.status]?.color || 'bg-stone-100 text-stone-600'}`}>
                      <option value="pending">Chờ xử lý</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="shipping">Đang giao</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-20 text-center text-stone-400 font-bold uppercase tracking-widest">Không có đơn hàng nào</div>
          )}
        </div>
      </div>
    </div>
  )
}
