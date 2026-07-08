import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from "react-router-dom"
import React, { Suspense, lazy } from 'react';
import AppSkeleton from './components/Common/AppSkeleton';
import ServerWakeup from './components/Common/ServerWakeup';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

// Lazy-load ALL route components for code splitting
const Homepage = lazy(() => import('./pages/Homepage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const Settings = lazy(() => import('./pages/Settings'));
const Adminlogin = lazy(() => import('./components/Admin/components/Adminlogin'));
const Adminhome = lazy(() => import('./components/Admin/Adminpages/Adminhome'));
const Productview = lazy(() => import('./components/Customer/Prouductview'));
const Checkout = lazy(() => import('./components/Customer/Checkout'));
const AuthModal = lazy(() => import('./components/Customer/AuthModal'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const SitePrivacy = lazy(() => import("./components/Customer/Policys/SitePrivacy"));
const TermsAndConditions = lazy(() => import('./components/Customer/Policys/TermsAndConditions'));
const Support = lazy(() => import('./components/Customer/Policys/Support'));
const Affiliate = lazy(() => import("./components/Customer/Affiliate"));
const BrandRegistry = lazy(() => import("./components/Customer/BrandRegistry"));
const Shipping = lazy(() => import("./components/Customer/Policys/Shipping"));
const Returns = lazy(() => import("./components/Customer/Policys/Returns"));
const TrackOrder = lazy(() => import("./components/Customer/Policys/TrackOrder"));
const FAQs = lazy(() => import("./components/Customer/Policys/FAQs"));
const AboutUs = lazy(() => import("./components/Customer/Company/AboutUs"));
const Contact = lazy(() => import("./components/Customer/Company/Contact"));
const CategoriesSpecificpage = lazy(() => import("./components/Customer/Landing/CategoriesSpecificpage"));
const ShopProductsPage = lazy(() => import("./pages/ShopProductsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

import {
  ProtectedCustomerRoute,
  ProtectedAdminRoute,
  PublicRoute
} from './components/Customer/ProtectedRoute'
import useDocumentTitle from './hooks/useDocumentTitle'

const DocumentTitleUpdater = () => {
  useDocumentTitle();
  return null;
};

const LoginRedirect = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const to = redirect ? `/?auth=login&redirect=${encodeURIComponent(redirect)}` : '/?auth=login';
  return <Navigate to={to} replace />;
};

const RegisterRedirect = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const to = redirect ? `/?auth=register&redirect=${encodeURIComponent(redirect)}` : '/?auth=register';
  return <Navigate to={to} replace />;
};

function App() {
  return (
    <Router>
      <DocumentTitleUpdater />
      <Suspense fallback={<AppSkeleton />}>
        <Routes>

          <Route path="/" element={<Homepage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<Productview />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/category/:categorySlug" element={<CategoriesSpecificpage />} />
          <Route path="/shop/:sellerId" element={<ShopProductsPage />} />

          <Route
            path="/Login"
            element={
              <LoginRedirect />
            }
          />
          <Route
            path="/Register"
            element={
              <RegisterRedirect />
            }
          />
          <Route
            path="/admin-login"
            element={
              <PublicRoute>
                <Adminlogin />
              </PublicRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedAdminRoute>
                <Adminhome />
              </ProtectedAdminRoute>
            }
          />

          <Route path="/privacy-policy" element={<SitePrivacy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/Settings"
            element={
              <ProtectedCustomerRoute>
                <Settings />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/Cart"
            element={
              <ProtectedCustomerRoute>
                <CartPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/Wishlist"
            element={
              <ProtectedCustomerRoute>
                <WishlistPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedCustomerRoute>
                <Checkout />
              </ProtectedCustomerRoute>
            }
          />

          <Route path="/Support" element={<Support />} />
          <Route path="/Affiliate" element={<Affiliate />} />
          <Route path="/BrandRegistry" element={<BrandRegistry />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ServerWakeup />
      <Suspense fallback={null}>
        <AuthModal />
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  )
}

export default App
