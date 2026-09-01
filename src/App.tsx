import { Analytics } from '@vercel/analytics/react';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import TopBanner from './components/layout/TopBanner';
import StructuredData from './components/StructuredData';
import ScrollToTop from './components/ui/ScrollToTop';
import { seoGuides } from './data/seoGuides';
import Home from './pages/Home';

const About = lazy(() => import('./pages/About'));
const Document = lazy(() => import('./pages/Document'));
const Energy = lazy(() => import('./features/energy/EnergyPage'));
const Government = lazy(() => import('./features/government/GovernmentPage'));
const Search = lazy(() => import('./pages/Search'));
const SeoLandingPage = lazy(() => import('./pages/SeoLandingPage'));
const Services = lazy(() => import('./pages/Services'));
const Sitemap = lazy(() => import('./pages/Sitemap'));
const Transparency = lazy(
  () => import('./features/transparency/TransparencyPage'),
);

function App() {
  return (
    <Router>
      <NuqsAdapter>
        <StructuredData />
        <div className="min-h-screen flex flex-col">
          <TopBanner />
          <Navbar />
          <ScrollToTop />
          <div className="flex-grow flex flex-col">
            <Suspense
              fallback={
                <div
                  className="flex min-h-64 items-center justify-center text-sm text-gray-600"
                  role="status"
                >
                  Loading page…
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services/:category" element={<Services />} />
                <Route path="/services" element={<Services />} />
                <Route path="/energy" element={<Energy />} />
                <Route path="/government" element={<Government />} />
                <Route path="/transparency" element={<Transparency />} />
                <Route path="/about" element={<About />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/search" element={<Search />} />
                {seoGuides.map((guide) => (
                  <Route
                    key={guide.path}
                    path={guide.path}
                    element={<SeoLandingPage guide={guide} />}
                  />
                ))}
                <Route path="/:lang/:documentSlug" element={<Document />} />
                <Route path="/:documentSlug" element={<Document />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </div>
        <Analytics />
      </NuqsAdapter>
    </Router>
  );
}

export default App;
