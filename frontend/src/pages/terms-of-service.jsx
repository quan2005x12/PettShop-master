import React from 'react'

const PolicySection = ({ title, children, emoji }) => (
  <section className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 mb-8 relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
    <div className="absolute top-6 right-6 text-4xl opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
      {emoji}
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
      <span className="w-2 h-8 bg-teal-600 rounded-full"></span>
      {title}
    </h2>
    <div className="text-slate-600 leading-relaxed space-y-4 font-light">
      {children}
    </div>
  </section>
)

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#f6f6f7] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-16">
          <div className="inline-block px-6 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-bold tracking-widest uppercase mb-6">
            Pháp lý
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Điều khoản <span className="text-teal-600">dịch vụ</span>
          </h1>
          <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">
            Chào mừng bạn đến với cộng đồng PETT! Bằng cách sử dụng trang web của chúng tôi, bạn đồng ý tuân thủ các điều khoản sau đây để đảm bảo một môi trường mua sắm văn minh và an toàn. 🐈
          </p>
        </header>

        {/* Content Sections */}
        <PolicySection title="1. Tài khoản & Đăng nhập" emoji="👤">
          <p>Dịch vụ của chúng tôi sử dụng phương thức đăng nhập qua Google để tối giản hóa trải nghiệm người dùng:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bạn có trách nhiệm bảo mật thông tin tài khoản Google dùng để truy cập PETT.</li>
            <li>Chúng tôi có quyền tạm khóa hoặc chấm dứt tài khoản nếu phát hiện có hành vi gian lận hoặc vi phạm chính sách cộng đồng.</li>
            <li>Chỉ những người dùng từ 13 tuổi trở lên mới được phép tạo tài khoản và thực hiện giao dịch.</li>
          </ul>
        </PolicySection>

        <PolicySection title="2. Chính sách mua hàng & Giá cả" emoji="💰">
          <p>Chúng tôi luôn nỗ lực hiển thị thông tin sản phẩm và giá cả chính xác nhất:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Giá sản phẩm được niêm yết bằng VNĐ và đã bao gồm thuế VAT (nếu có).</li>
            <li>PETT có quyền thay đổi giá hoặc hủy đơn hàng nếu có sai sót kỹ thuật về giá hoặc thông tin sản phẩm trên hệ thống.</li>
            <li>Đơn hàng chỉ được xác nhận sau khi chúng tôi kiểm tra tình trạng tồn kho thực tế.</li>
          </ul>
        </PolicySection>

        <PolicySection title="3. Giao hàng & Vận chuyển" emoji="🚚">
          <p>PETT cam kết mang niềm vui đến cho thú cưng của bạn trong thời gian ngắn nhất:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Thời gian giao hàng dự kiến từ 1-3 ngày làm việc (nội thành) và 3-5 ngày (ngoại tỉnh).</li>
            <li>Phí vận chuyển sẽ được tính toán tự động tại trang thanh toán dựa trên địa chỉ của bạn.</li>
            <li>Trường hợp có sự cố do bất khả kháng (thiên tai, dịch bệnh), chúng tôi sẽ thông báo và cập nhật tiến độ giao hàng sớm nhất có thể.</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. Chính sách đổi trả & Hoàn tiền" emoji="🔄">
          <p>Chúng tôi hiểu rằng đôi khi bạn có thể thay đổi ý định:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sản phẩm được đổi trả trong vòng 7 ngày kể từ khi nhận hàng nếu còn nguyên tem, mác và chưa qua sử dụng.</li>
            <li>Đối với các sản phẩm thức ăn hoặc đồ tươi sống, chúng tôi chỉ hỗ trợ đổi trả nếu bao bì bị hỏng do lỗi vận chuyển hoặc sản phẩm hết hạn.</li>
            <li>Tiền hoàn lại sẽ được xử lý vào tài khoản của bạn trong vòng 3-5 ngày làm việc sau khi chúng tôi nhận lại hàng.</li>
          </ul>
        </PolicySection>

        <PolicySection title="5. Giới hạn trách nhiệm" emoji="⚖️">
          <p>Mặc dù chúng tôi luôn cố gắng mang lại dịch vụ tốt nhất, PETT không chịu trách nhiệm đối với:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bất kỳ thiệt hại nào phát sinh từ việc sử dụng sản phẩm sai mục đích hoặc không theo hướng dẫn của nhà sản xuất.</li>
            <li>Các gián đoạn truy cập trang web do sự cố hạ tầng internet hoặc bảo trì định kỳ.</li>
            <li>Các thông tin do người dùng tự ý cung cấp không chính xác trên nền tảng.</li>
          </ul>
        </PolicySection>

        {/* Footer Note */}
        <footer className="mt-16 text-center pt-8 text-slate-400 text-sm font-light">
        </footer>
      </div>
    </div>
  )
}
