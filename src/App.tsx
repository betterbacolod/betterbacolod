import { Analytics } from '@vercel/analytics/react';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import TopBanner from './components/layout/TopBanner';
import ScrollToTop from './components/ui/ScrollToTop';
import About from './pages/About';
import Document from './pages/Document';
import Government from './pages/Government';
import Home from './pages/Home';
import Search from './pages/Search';
import Services from './pages/Services';
import Sitemap from './pages/Sitemap';
import Transparency from './pages/Transparency';

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
