import StitchScreenFrame from '../components/stitch-screen-frame'
import checkoutHtml from '../stitch-html/subscription-checkout-modern-playful.html?raw'

export default function CheckoutSubscriptionPage() {
  return (
    <StitchScreenFrame 
      html={checkoutHtml} 
      title="Thanh toán Gói định kỳ" 
      fitContent={true} 
    />
  )
}
