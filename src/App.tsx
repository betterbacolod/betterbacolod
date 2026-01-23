import { Analytics } from '@vercel/analytics/react';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import TopBanner from './components/layout/TopBanner';
import StructuredData from './components/StructuredData';
import ScrollToTop from './components/ui/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Document = lazy(() => import('./pages/Document'));
const Government = lazy(() => import('./pages/Government'));
const Search = lazy(() => import('./pages/Search'));
const Services = lazy(() => import('./pages/Services'));
const Sitemap = lazy(() => import('./pages/Sitemap'));
const Transparency = lazy(() => import('./pages/Transparency'));

function LoadingFallback() {
  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading...</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <NuqsAdapter>
        <StructuredData />
        <div className="min-h-screen flex flex-col">
          <TopBanner />
          <Navbar />
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <div className="flex-grow flex flex-col">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services/:category" element={<Services />} />
                <Route path="/services" element={<Services />} />
                <Route path="/government" element={<Government />} />
                <Route path="/transparency" element={<Transparency />} />
                <Route path="/about" element={<About />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/search" element={<Search />} />
                <Route path="/:lang/:documentSlug" element={<Document />} />
                <Route path="/:documentSlug" element={<Document />} />
              </Routes>
            </div>
          </Suspense>
          <Footer />
        </div>
        <Analytics />
      </NuqsAdapter>
    </Router>
  );
}

export default App;
