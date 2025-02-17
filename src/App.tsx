import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useScrollToTop } from './hooks/useScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ServicesPage from './components/ServicesPage';

// Lazy load components
const ServiceDetail = lazy(() => import('./components/ServiceDetail'));
const BlogList = lazy(() => import('./components/BlogList'));
const BlogPost = lazy(() => import('./components/BlogPost'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AuthModal = lazy(() => import('./components/auth/AuthModal'));
const Products = lazy(() => import('./components/Products'));
const About = lazy(() => import('./components/About'));
const ValuePropositionPage = lazy(() => import('./components/ValuePropositionPage'));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, isAdmin } = useAuth();
  return session && isAdmin ? <>{children}</> : <Navigate to="/" />;
}

function AppContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  useScrollToTop(); // Add the hook here

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
      <Suspense fallback={null}>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
          />
        )}
      </Suspense>
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