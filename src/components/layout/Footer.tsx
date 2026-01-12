import { Facebook, Github, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { footerNavigation } from '../../data/navigation';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/B-Logo/BetterBacolod Icons_favicon tp.png"
                alt="BetterBacolod"
                className="h-10 w-10"
              />
              <div className="font-bold">BetterBacolod</div>
            </div>
            <p className="text-slate-400 text-sm mb-5 leading-relaxed">
              Open-source civic tech initiative making government information
              accessible for Bacolodnons.
            </p>
            <div className="flex gap-3">
              {footerNavigation.socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              ))}
              <a
                href="https://discord.gg/EZkdJrhBYV"
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/betterbacolod/betterbacolod"
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Nav sections */}
          {footerNavigation.mainSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) =>
                  link.href.startsWith('http') ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-10 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} BetterBacolod · Not an official
              government website
            </p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">
                💸 Built for ₱435.39
              </span>
              <Link
                to="/sitemap"
                className="text-slate-500 hover:text-white text-sm transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
