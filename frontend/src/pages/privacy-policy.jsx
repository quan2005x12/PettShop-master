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

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f6f6f7] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-16">
          <div className="inline-block px-6 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-bold tracking-widest uppercase mb-6">
            Pháp lý
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Chính sách <span className="text-teal-600">bảo mật</span>
          </h1>
          <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">
            Tại PETT, sự riêng tư của bạn và "người bạn bốn chân" là ưu tiên hàng đầu của chúng tôi. Chúng tôi cam kết bảo vệ dữ liệu của bạn một cách minh bạch và an toàn. 🐾
          </p>
        </header>

        {/* Content Sections */}
        <PolicySection title="1. Thông tin chúng tôi thu thập" emoji="🐶">
          <p>Để mang lại trải nghiệm chăm sóc thú cưng tốt nhất, chúng tôi thu thập một số thông tin cơ bản khi bạn sử dụng dịch vụ:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Thông tin định danh:</strong> Tên, địa chỉ email và ảnh đại diện từ tài khoản Google của bạn.</li>
            <li><strong>Dữ liệu giao dịch:</strong> Lịch sử mua hàng, địa chỉ giao hàng và thông tin thanh toán (được xử lý an toàn qua đối tác).</li>
            <li><strong>Sở thích thú cưng:</strong> Loại thú cưng, giống và thói quen tiêu dùng để chúng tôi có thể gợi ý sản phẩm phù hợp nhất.</li>
          </ul>
        </PolicySection>

        <PolicySection title="2. Cách chúng tôi sử dụng thông tin" emoji="🦴">
          <p>Mọi dữ liệu thu thập được đều phục vụ mục đích nâng cao chất lượng cuộc sống cho thú cưng của bạn:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Xử lý và giao đơn hàng nhanh chóng, chính xác.</li>
            <li>Gửi các ưu đãi đặc quyền, mã giảm giá và mẹo chăm sóc thú cưng cá nhân hóa.</li>
            <li>Phân tích xu hướng để cải thiện danh mục sản phẩm và dịch vụ khách hàng.</li>
            <li>Đảm bảo an toàn và ngăn chặn các hành vi gian lận.</li>
          </ul>
        </PolicySection>

        <PolicySection title="3. Bảo mật dữ liệu cá nhân" emoji="🛡️">
          <p>Chúng tôi sử dụng các công nghệ bảo mật tiên tiến nhất để bảo vệ thông tin của bạn:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Toàn bộ dữ liệu được truyền tải qua giao thức mã hóa SSL/TLS chuẩn quốc tế.</li>
            <li>Hệ thống lưu trữ đám mây an toàn với nhiều lớp tường lửa bảo vệ.</li>
            <li>Chúng tôi cam kết <strong>KHÔNG BAO GIỜ</strong> bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích tiếp thị mà không có sự đồng ý.</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. Quyền lợi của bạn" emoji="🐾">
          <p>Bạn luôn có toàn quyền kiểm soát dữ liệu của mình tại PETT:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bạn có thể truy cập và cập nhật thông tin cá nhân bất kỳ lúc nào trong phần cài đặt tài khoản.</li>
            <li>Bạn có quyền yêu cầu trích xuất dữ liệu hoặc xóa hoàn toàn tài khoản và dữ liệu liên quan khỏi hệ thống của chúng tôi.</li>
            <li>Bạn có thể chọn từ chối nhận email thông báo khuyến mãi bất cứ khi nào bạn muốn.</li>
          </ul>
        </PolicySection>

      </div>
    </div>
  )
}
