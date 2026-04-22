import { Link, useNavigate } from 'react-router-dom'

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#fbfaee]">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-12 rounded-[3rem] shadow-2xl shadow-teal-900/5 border border-teal-50">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="material-symbols-outlined text-teal-600 text-5xl">lock</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-container text-white rounded-full flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-sm">priority_high</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-headline font-black text-slate-900 tracking-tight">Truy cập bị hạn chế</h1>
          <p className="text-slate-500 leading-relaxed font-medium">
            Rất tiếc, bạn không có quyền truy cập vào khu vực này. Vui lòng liên hệ quản trị viên hoặc đăng nhập bằng tài khoản có quyền phù hợp.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại trang trước
          </button>
          <Link 
            to="/" 
            className="w-full py-4 bg-teal-50 text-teal-700 font-bold rounded-2xl transition-all hover:bg-teal-100 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">home</span>
            Về trang chủ
          </Link>
        </div>

        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest pt-4">
          PETT Security System v1.0
        </p>
      </div>
    </div>
  )
}
