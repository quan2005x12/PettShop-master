import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { useCart } from '../context/cartContext'
import { createOrder } from '../api'

export default function CheckoutPage() {
  const { user, refreshUser } = useAuth()
  const { cart, getSubtotal, getVipDiscount, getTotalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    paymentMethod: 'cod'
  })

  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      navigate('/shop')
    }
  }, [cart, navigate, isSuccess])

  const subtotal = getSubtotal()
  const discount = getVipDiscount()
  const total = getTotalPrice()

  const handleCheckout = async (e) => {
    e.preventDefault()
    
    if (!formData.phone.trim() || !formData.address.trim()) {
      alert('Vui lòng điền đầy đủ Số điện thoại và Địa chỉ giao hàng trước khi thanh toán.')
      return
    }
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const order = await createOrder({
        items: cart.map(i => ({
          id: i.id,
          name: i.name,
          price: Number(i.price),
          quantity: i.quantity || 1,
          images: i.images || [i.image]
        })),
        total_amount: Number(total),
        payment_method: formData.paymentMethod,
        shipping_address: formData.address,
        customer_phone: formData.phone
      })

      setIsSuccess(true)
      clearCart()
      
      // Refresh user info to get new subscription tier if purchased
      await refreshUser()
      
      if (formData.paymentMethod === 'momo') {
        navigate(`/checkout-momo?orderId=${order.id}&amount=${total}`)
      } else {
        navigate(`/checkout-success?orderId=${order.id}`)
      }
    } catch (err) {
      console.error(err)
      alert('Đã có lỗi xảy ra kết nối với máy chủ: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatVnd = (val) => Number(val).toLocaleString('vi-VN') + '₫'

  return (
    <div className="min-h-screen bg-[#fbfaee] font-body text-stone-800 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-10 py-10">
        <Link to="/cart" className="flex items-center gap-2 text-stone-400 hover:text-teal-600 transition-colors mb-10 group">
           <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
           <span className="text-xs font-black uppercase tracking-widest">Quay lại giỏ hàng</span>
        </Link>

        <h1 className="text-4xl font-black text-stone-800 mb-12 tracking-tight">Thanh toán đơn hàng</h1>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-stone-200 shadow-sm">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm">1</span>
                Thông tin người nhận
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Người mua</label>
                    <input disabled value={user?.full_name || ''} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none font-bold text-stone-400 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Số điện thoại</label>
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-teal-600/20 focus:bg-white transition-all outline-none font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Địa chỉ giao hàng</label>
                  <textarea 
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-teal-600/20 focus:bg-white transition-all outline-none font-medium resize-none"
                    placeholder="Nhập địa chỉ đầy đủ của bạn..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-stone-200 shadow-sm">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm">2</span>
                Hình thức thanh toán
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                  <label 
                    onClick={() => setFormData({...formData, paymentMethod: 'cod'})}
                    className={`flex-1 cursor-pointer flex items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 ${
                      formData.paymentMethod === 'cod' 
                        ? 'border-teal-600 bg-teal-50 shadow-lg shadow-teal-600/5' 
                        : 'border-stone-100 hover:border-stone-200 bg-stone-50/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === 'cod' ? 'border-teal-600 bg-teal-600' : 'border-stone-300'}`}>
                      {formData.paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="material-symbols-outlined text-teal-600">payments</span>
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-stone-800">Tiền mặt (COD)</span>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">Thanh toán khi nhận hàng</span>
                    </div>
                  </label>

                  <label 
                    onClick={() => setFormData({...formData, paymentMethod: 'momo'})}
                    className={`flex-1 cursor-pointer flex items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 ${
                      formData.paymentMethod === 'momo' 
                        ? 'border-[#a50064] bg-[#a50064]/5 shadow-lg shadow-momo/5' 
                        : 'border-stone-100 hover:border-stone-200 bg-stone-50/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === 'momo' ? 'border-[#a50064] bg-[#a50064]' : 'border-stone-300'}`}>
                      {formData.paymentMethod === 'momo' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="w-6 h-6 object-contain" />
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-stone-800">Ví MoMo</span>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">Thanh toán qua mã QR</span>
                    </div>
                  </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-stone-200 shadow-sm sticky top-10">
              <h2 className="text-xl font-black mb-8 text-stone-800">Tóm tắt giỏ hàng</h2>
              <div className="space-y-6 mb-10 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-stone-100 shrink-0">
                      <img src={item.images?.[0] || item.image || '/images/pett-bag.webp'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-black text-stone-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs font-bold text-stone-400">SL: {item.quantity || 1}</p>
                    </div>
                    <p className="text-sm font-black text-teal-600">{formatVnd(Number(item.price) * (item.quantity || 1))}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-stone-100">
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-stone-400">
                      Giảm giá {user?.subscription_tier === 'vip' ? 'VIP (15%)' : 'PRO (10%)'}
                    </span>
                    <span className="font-black text-coral-500">-{formatVnd(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl pt-4">
                  <span className="font-black text-stone-800">Tổng thanh toán</span>
                  <span className="font-black text-teal-600">{formatVnd(total)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-12 py-5 rounded-[2rem] bg-teal-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-600/20 hover:bg-teal-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:bg-stone-100"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
