import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/cartContext'
import { useAuth } from '../context/authContext'

export default function CartPage() {
  const { user } = useAuth()
  const { cart, updateQuantity, removeFromCart, getSubtotal, getVipDiscount, getTotalPrice } = useCart()
  const navigate = useNavigate()

  const formatVnd = (val) => Number(val).toLocaleString('vi-VN') + '₫'

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbfaee] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-32 bg-stone-100 rounded-full flex items-center justify-center mb-8">
           <span className="material-symbols-outlined text-5xl text-stone-300">shopping_cart_off</span>
        </div>
        <h2 className="text-2xl font-black text-stone-800 mb-2">Giỏ hàng trống</h2>
        <p className="text-stone-500 mb-10">Hãy chọn những món quà tuyệt vời nhất cho thú cưng của bạn!</p>
        <Link to="/shop" className="px-10 py-4 bg-teal-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all">
           Đến cửa hàng ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fbfaee] font-body text-stone-800 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-10 py-12">
        <h1 className="text-4xl font-black text-stone-800 mb-12 tracking-tight">Giỏ hàng của bạn</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-stone-200 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                <div className="w-24 h-24 bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 shrink-0">
                  <img src={item.images?.[0] || item.image || '/images/pett-bag.webp'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="font-black text-stone-800 text-lg leading-tight">{item.name}</p>
                        <p className="text-xs font-bold text-stone-400 mt-1 uppercase tracking-widest">{item.category}</p>
                     </div>
                     <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">delete</span>
                     </button>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                     <div className="flex items-center bg-stone-100 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} className="w-8 h-8 flex items-center justify-center font-black text-stone-500 hover:text-teal-600 transition-colors">−</button>
                        <span className="w-10 text-center font-black text-sm">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="w-8 h-8 flex items-center justify-center font-black text-stone-500 hover:text-teal-600 transition-colors">+</button>
                     </div>
                     <p className="font-black text-teal-600 text-lg">{formatVnd(Number(item.price) * (item.quantity || 1))}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-10 rounded-[3.5rem] border border-stone-200 shadow-sm sticky top-10">
                <h2 className="text-xl font-black mb-8">Tổng cộng</h2>
                <div className="space-y-4 mb-10">
                   <div className="flex justify-between text-sm">
                      <span className="font-bold text-stone-400">Tạm tính</span>
                      <span className="font-black text-stone-800">{formatVnd(getSubtotal())}</span>
                   </div>
                   {getVipDiscount() > 0 && (
                     <div className="flex justify-between text-sm">
                        <span className="font-bold text-stone-400">
                          Giảm giá {user?.subscription_tier === 'vip' ? 'VIP (15%)' : 'PRO (10%)'}
                        </span>
                        <span className="font-black text-coral-500">-{formatVnd(getVipDiscount())}</span>
                     </div>
                   )}
                   <div className="flex justify-between text-sm">
                      <span className="font-bold text-stone-400">Phí giao hàng</span>
                      <span className="font-black text-teal-600 uppercase tracking-widest text-[10px]">Miễn phí</span>
                   </div>
                   <div className="h-px bg-stone-100 my-2"></div>
                   <div className="flex justify-between text-2xl">
                      <span className="font-black">Tổng tiền</span>
                      <span className="font-black text-teal-600">{formatVnd(getTotalPrice())}</span>
                   </div>
                </div>

               <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-5 bg-teal-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-600/20 hover:bg-teal-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
               >
                  Thanh toán <span className="material-symbols-outlined">arrow_forward</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
