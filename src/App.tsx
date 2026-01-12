import { NuqsAdapter } from 'nuqs/adapters/react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import TopBanner from './components/layout/TopBanner';
import Home from './pages/Home';
import ScrollToTop from './components/ui/ScrollToTop';
import Services from './pages/Services';
import Government from './pages/Government';
import Transparency from './pages/Transparency';
import About from './pages/About';
import Sitemap from './pages/Sitemap';
import Search from './pages/Search';
import Document from './pages/Document';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <NuqsAdapter>
        <div className="min-h-screen flex flex-col">
          <TopBanner />
          <Navbar />
          <ScrollToTop />
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
          <Footer />
        </div>
        <Analytics />
      </NuqsAdapter>
    </Router>
  );
}

export default App;
