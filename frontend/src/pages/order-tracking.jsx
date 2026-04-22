import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_BASE_URL } from '../api'

export default function OrderTrackingPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem('pett_token')
        const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Không tìm thấy đơn hàng')
        const data = await res.json()
        setOrder(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchOrderDetail()
  }, [id])

  const formatVnd = (val) => Number(val).toLocaleString('vi-VN') + '₫'

  const getParsedItems = (items) => {
    if (!items) return []
    if (typeof items === 'string') {
      try { return JSON.parse(items) } catch (e) { return [] }
    }
    return Array.isArray(items) ? items : []
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-teal-600 animate-pulse">Đang tải thông tin đơn hàng...</div>
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
      <h2 className="text-2xl font-black text-stone-800 mb-2">Rất tiếc!</h2>
      <p className="text-stone-500 mb-6">{error}</p>
      <Link to="/" className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest">Về trang chủ</Link>
    </div>
  )

  const steps = [
    { label: 'Đã xác nhận', status: ['pending', 'confirmed', 'processing', 'shipping', 'completed'], icon: 'check_circle' },
    { label: 'Chuẩn bị', status: ['processing', 'shipping', 'completed'], icon: 'inventory_2' },
    { label: 'Đang giao', status: ['shipping', 'completed'], icon: 'local_shipping' },
    { label: 'Hoàn tất', status: ['completed'], icon: 'home' }
  ]

  const currentStepIndex = steps.findIndex(step => step.status.includes(order.status))

  return (
    <div className="min-h-screen bg-[#fbfaee] font-body text-stone-800 p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Link to="/" className="text-3xl font-black text-teal-700 tracking-tighter uppercase">PETT</Link>
          <div className="bg-white px-6 py-3 rounded-full border border-stone-200 shadow-sm flex items-center gap-3">
             <span className="material-symbols-outlined text-teal-600">receipt_long</span>
             <p className="text-sm font-black text-stone-400 uppercase tracking-widest">Mã đơn hàng: <span className="text-teal-600">#ORD-{order.id.toString().padStart(4, '0')}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Status Stepper */}
            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-stone-200 shadow-sm">
              <h2 className="text-xl font-black mb-12">Trạng thái đơn hàng</h2>
              <div className="relative flex justify-between">
                {/* Line background */}
                <div className="absolute top-5 left-0 w-full h-1 bg-stone-100 -z-0"></div>
                <div className="absolute top-5 left-0 h-1 bg-teal-600 transition-all duration-1000" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>
                
                {steps.map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                      i <= currentStepIndex ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'bg-white text-stone-300 border-4 border-stone-100'
                    }`}>
                      <span className="material-symbols-outlined text-xl">{i <= currentStepIndex ? 'check' : step.icon}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                      i <= currentStepIndex ? 'text-teal-600' : 'text-stone-300'
                    }`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-stone-200 shadow-sm">
               <h2 className="text-xl font-black mb-8">Sản phẩm</h2>
                <div className="space-y-6">
                   {getParsedItems(order.items).length > 0 ? getParsedItems(order.items).map((item, i) => (
                     <div key={i} className="flex items-center gap-6 p-4 bg-stone-50 rounded-[2rem] border border-stone-100">
                        <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border border-stone-200">
                           <img src={item.images?.[0] || '/images/pett-bag.webp'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                           <p className="font-black text-stone-800">{item.name}</p>
                           <p className="text-xs font-bold text-stone-400 mt-1">Số lượng: {item.quantity || 1}</p>
                        </div>
                        <p className="font-black text-teal-600">{formatVnd(item.price * (item.quantity || 1))}</p>
                     </div>
                   )) : (
                     <p className="text-center text-stone-400 font-bold">Không có thông tin sản phẩm</p>
                   )}
                </div>
            </div>
          </div>

          <div className="space-y-8">
             {/* Payment Details */}
             <div className="bg-teal-700 p-10 rounded-[3rem] text-white shadow-xl shadow-teal-700/20">
                <h2 className="text-xl font-black mb-8">Chi tiết thanh toán</h2>
                <div className="space-y-4">
                   <div className="flex justify-between text-sm">
                      <span className="font-bold opacity-60">Tạm tính</span>
                      <span className="font-black">{formatVnd(order.total_amount)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="font-bold opacity-60">Phí giao hàng</span>
                      <span className="font-black uppercase">Miễn phí</span>
                   </div>
                   <div className="h-px bg-white/10 my-2"></div>
                   <div className="flex justify-between text-lg">
                      <span className="font-black">Tổng cộng</span>
                      <span className="font-black underline decoration-2 underline-offset-4">{formatVnd(order.total_amount)}</span>
                   </div>
                </div>
                <div className="mt-8 flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/10">
                   <span className="material-symbols-outlined">payments</span>
                   <p className="text-[10px] font-black uppercase tracking-widest">{order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán qua ví MoMo'}</p>
                </div>
             </div>

             {/* Shipping Info */}
             <div className="bg-white p-10 rounded-[3rem] border border-stone-200 shadow-sm">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Giao hàng đến</p>
                <div className="space-y-1">
                   <p className="font-black text-stone-800 text-lg">{order.user_name || 'Khách hàng'}</p>
                   <p className="text-stone-500 text-sm font-bold">{order.customer_phone || order.user_email}</p>
                   <p className="text-stone-400 text-sm font-medium leading-relaxed mt-4">
                      {order.shipping_address || 'Đang cập nhật địa chỉ...'}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
