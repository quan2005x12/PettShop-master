import { useSearchParams, Link } from 'react-router-dom'

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-[#fbfaee] font-body flex items-center justify-center p-6 relative">
      <button 
        onClick={() => navigate('/shop')}
        className="absolute top-10 left-10 flex items-center gap-2 text-stone-400 hover:text-teal-600 transition-colors group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="text-[10px] font-black uppercase tracking-widest">Trở về cửa hàng</span>
      </button>

      <div className="max-w-xl w-full bg-white p-12 md:p-20 rounded-[4rem] border border-stone-200 shadow-xl text-center space-y-10 animate-zoom-in">
         <div className="w-24 h-24 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-teal-600/30">
            <span className="material-symbols-outlined text-5xl">check_circle</span>
         </div>
         
         <div>
            <h1 className="text-4xl font-black text-stone-800 tracking-tight mb-4">Đặt hàng thành công!</h1>
            <p className="text-stone-500 font-medium leading-relaxed">
               Cảm ơn bạn đã tin tưởng PETT. Đơn hàng của bạn đang được hệ thống xác nhận và sẽ sớm được giao đến bạn.
            </p>
         </div>

         <div className="bg-stone-50 p-6 rounded-[2.5rem] border border-stone-100">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Mã đơn hàng của bạn</p>
            <p className="text-2xl font-black text-teal-600">#ORD-{orderId?.toString().padStart(4, '0') || 'N/A'}</p>
         </div>

         <div className="flex flex-col gap-4">
            <Link 
              to={`/order-tracking/${orderId}`}
              className="w-full py-5 bg-teal-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-600/20 hover:bg-teal-700 hover:scale-[1.02] transition-all"
            >
               Theo dõi đơn hàng
            </Link>
            <Link 
              to="/shop"
              className="w-full py-5 text-stone-400 font-black uppercase tracking-[0.2em] hover:text-teal-600 transition-all"
            >
               Tiếp tục mua sắm
            </Link>
         </div>
      </div>
    </div>
  )
}
