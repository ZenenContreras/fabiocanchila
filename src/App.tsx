import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useScrollToTop } from './hooks/useScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ServicesPage from './components/ServicesPage';
import Loading from './components/Loading';
import AuthModal from './components/auth/AuthModal';

// Lazy load components
const ServiceDetail = lazy(() => import('./components/ServiceDetail'));
const BlogList = lazy(() => import('./components/BlogList').then(module => ({
  default: module.default
})));
const BlogPost = lazy(() => import('./components/BlogPost'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const Products = lazy(() => import('./components/Products'));
const About = lazy(() => import('./components/About'));
const ValuePropositionPage = lazy(() => import('./components/ValuePropositionPage'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, isAdmin } = useAuth();
  return session && isAdmin ? <>{children}</> : <Navigate to="/" />;
}

function AppContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  useScrollToTop();

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={signOut}
        isLoggedIn={!!user}
      />
      <main className="flex-grow">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/products" element={<Products />} />
            <Route path="/value-proposition/:id" element={<ValuePropositionPage />} />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
          />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}