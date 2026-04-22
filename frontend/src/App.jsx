import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import Layout from './components/layout'

const HomePage = lazy(() => import('./pages/home'))
const ShopPage = lazy(() => import('./pages/shop'))
const BlogPage = lazy(() => import('./pages/blog'))
const ProductDetailPage = lazy(() => import('./pages/product-detail'))
const BlogDetailPage = lazy(() => import('./pages/blog-detail'))
const CartPage = lazy(() => import('./pages/cart'))
const PurposeSubscriptionPage = lazy(() => import('./pages/purpose-subscription'))
const CheckoutPage = lazy(() => import('./pages/checkout'))
const CheckoutSuccessPage = lazy(() => import('./pages/checkout-success'))
const CheckoutMomoPage = lazy(() => import('./pages/checkout-momo'))
const OrderTrackingPage = lazy(() => import('./pages/order-tracking'))
const LoginPage = lazy(() => import('./pages/login'))
const RegisterPage = lazy(() => import('./pages/register'))
const ProfilePage = lazy(() => import('./pages/profile'))
const PrivacyPolicyPage = lazy(() => import('./pages/privacy-policy'))
const TermsOfServicePage = lazy(() => import('./pages/terms-of-service'))
const UnauthorizedPage = lazy(() => import('./pages/unauthorized'))
const CheckoutSubscriptionPage = lazy(() => import('./pages/checkout-subscription'))
const AdminDashboardPage = lazy(() => import('./pages/admin-dashboard'))
const AdminProductsPage = lazy(() => import('./pages/admin-products'))
const AdminOrdersPage = lazy(() => import('./pages/admin-orders'))
const AdminSubscriptionsPage = lazy(() => import('./pages/admin-subscriptions'))
const AdminBlogsPage = lazy(() => import('./pages/admin-blogs'))

import AuthGuard from './components/auth-guard'
import AdminLayout from './components/admin-layout'
import { useAuth } from './context/authContext'

const LoadingFallback = () => (
  <div className="min-h-[55vh] bg-background flex items-center justify-center">
    <span className="text-sm font-medium text-stone-500">Đang tải nội dung...</span>
  </div>
)

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingFallback />

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* --- ADMIN PORTAL ROUTES --- */}
        <Route element={<AuthGuard allowedRoles={['admin']} />}>
          <Route element={<AdminLayout><Outlet /></AdminLayout>}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="/admin/blogs" element={<AdminBlogsPage />} />
          </Route>
        </Route>

        {/* --- CUSTOMER & GENERAL ROUTES --- */}
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/goi-dinh-ky" element={<PurposeSubscriptionPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          
          <Route element={<AuthGuard allowedRoles={['customer', 'admin']} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout-momo" element={<CheckoutMomoPage />} />
            <Route path="/checkout-subscription" element={<CheckoutSubscriptionPage />} />
            <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

