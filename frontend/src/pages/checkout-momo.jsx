import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function CheckoutMomoPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    // Simulate payment detection after 5 seconds
    const timer = setTimeout(() => {
      setIsPaid(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const formatVnd = (val) => Number(val).toLocaleString('vi-VN') + '₫'

  const handleFinish = () => {
    navigate(`/checkout-success?orderId=${orderId}`)
  }

  return (
    <div className="min-h-screen bg-[#fbfaee] flex flex-col items-center justify-center p-6 relative">
      <button 
        onClick={() => navigate('/checkout')}
        className="absolute top-10 left-10 flex items-center gap-2 text-stone-400 hover:text-[#a50064] transition-colors group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="text-[10px] font-black uppercase tracking-widest">Quay lại</span>
      </button>

      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-momo/10 overflow-hidden border border-stone-100 animate-zoom-in">
        {/* Header */}
        <div className="bg-[#a50064] p-10 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '16px 16px' }}></div>
          
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-headline font-black mb-1 relative z-10">Thanh toán MoMo</h1>
          <p className="text-white/60 text-sm font-bold uppercase tracking-widest relative z-10">PETT Modern Pet Shop</p>
        </div>

        {/* QR Area */}
        <div className="p-10 flex flex-col items-center">
          <div className="mb-10 text-center">
            <span className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] block mb-2">Số tiền cần trả</span>
            <span className="text-4xl font-headline font-black text-stone-800 tracking-tighter">
              {formatVnd(amount || 0)}
            </span>
          </div>

          <div className="relative w-72 h-72 bg-white rounded-[2rem] shadow-inner border border-stone-100 p-6 flex items-center justify-center group">
            <div className={`absolute inset-0 border-2 border-[#a50064] rounded-[2rem] transition-all duration-1000 ${isPaid ? 'opacity-0 scale-110' : 'animate-pulse opacity-20'}`}></div>
            
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=2|99|0987654321|||0|0|${amount}|PETT Order ${orderId}`} 
              className={`w-full h-full object-contain transition-all duration-700 ${isPaid ? 'opacity-20 blur-sm scale-95' : 'opacity-100'}`} 
              alt="QR Code"
            />

            {isPaid && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-zoom-in">
                <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center shadow-xl shadow-teal-500/30 mb-4">
                  <span className="material-symbols-outlined text-white text-4xl">check</span>
                </div>
                <p className="text-teal-600 font-black uppercase tracking-widest text-[10px]">Đã nhận thanh toán</p>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center gap-4 text-stone-400 bg-stone-50 px-6 py-4 rounded-2xl border border-stone-100 max-w-xs">
            <span className="material-symbols-outlined text-stone-300">smartphone</span>
            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wide">Mở ứng dụng <b>MoMo</b> và chọn <b>Quét Mã</b> để thanh toán.</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-stone-50/50 border-t border-stone-100 space-y-3">
          <button 
            onClick={handleFinish}
            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
              isPaid 
                ? 'bg-[#a50064] text-white shadow-momo/20 hover:scale-[1.02]' 
                : 'bg-white text-stone-300 border border-stone-100 cursor-not-allowed'
            }`}
          >
            {isPaid ? 'Hoàn tất đơn hàng' : 'Đang chờ thanh toán...'}
            {isPaid && <span className="material-symbols-outlined">arrow_forward</span>}
          </button>
          
          {!isPaid && (
            <button onClick={() => navigate('/checkout')} className="w-full py-3 text-stone-300 hover:text-stone-600 font-black uppercase tracking-widest text-[10px] transition-colors">
              Hủy giao dịch
            </button>
          )}
        </div>
      </div>

      <p className="mt-10 text-stone-300 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">verified_user</span>
        Giao dịch bảo mật bởi MoMo
      </p>
    </div>
  )
}
