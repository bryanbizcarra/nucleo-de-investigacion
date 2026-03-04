
import React, { useEffect, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from './src/components/Navbar';
import { supabase } from './src/lib/supabase';

// Lazy loading components
const Home = React.lazy(() => import('./src/views/Home'));
const Details = React.lazy(() => import('./src/views/Details'));
const Blog = React.lazy(() => import('./src/views/Blog'));
const About = React.lazy(() => import('./src/views/About'));
const PublishPost = React.lazy(() => import('./src/views/PublishPost'));
const Login = React.lazy(() => import('./src/views/Login'));
const BlogPost = React.lazy(() => import('./src/views/BlogPost'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const LoadingFallback = () => (
  <div className="w-full h-[60vh] flex items-center justify-center">
    <Loader2 className="w-10 h-10 animate-spin text-[#702d8d]" />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <LoadingFallback />;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isBlog = location.pathname === '/blog' || location.pathname === '/publicar';

  return (
    <div className={`min-h-screen ${isBlog ? 'bg-[#702d8d]' : 'bg-[#f8f8f8]'} flex flex-col items-center relative overflow-x-hidden`}>
      <ScrollToTop />

      {/* Home Decoration */}
      {location.pathname === '/' && (
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-64 md:w-[500px] pointer-events-none opacity-40 z-0">
          <img src="/imagenes/decoracion1.webp" alt="" className="w-full h-auto" />
        </div>
      )}

      {location.pathname !== '/login' && <Navbar isBlog={isBlog} />}

      <div className={`w-full ${location.pathname === '/login' ? '' : 'pt-16 pb-8 md:pt-24 md:pb-8'} flex flex-col items-center`}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home onNavigate={(path) => navigate(path)} />} />
            <Route path="/details" element={<Details />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/publicar" element={
              <ProtectedRoute>
                <PublishPost />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
