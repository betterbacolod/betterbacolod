import React, { useState } from 'react';
import { X, Menu, ChevronDown, Search } from 'lucide-react';
import { mainNavigation } from '../../data/navigation';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) setActiveMenu(null);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setActiveMenu(null);
  };

  const toggleSubmenu = (label: string) => {
    setActiveMenu(activeMenu === label ? null : label);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/nav-logo.png"
              alt="BetterBacolod"
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainNavigation.map(item => (
              <div key={item.label} className="relative group">
                <Link
                  to={item.href}
                  className="flex items-center px-4 py-2 text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                  )}
                </Link>
                {item.children && (
                  <div className="absolute left-0 mt-1 w-56 rounded-lg shadow-lg bg-white ring-1 ring-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {item.children.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="block px-4 py-2 text-sm text-slate-600 hover:bg-primary-50 hover:text-primary-600"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/about"
              className="px-4 py-2 text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              About
            </Link>
            <Link
              to="/search"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {mainNavigation.map(item => (
              <div key={item.label}>
                <button
                  onClick={() =>
                    item.children ? toggleSubmenu(item.label) : closeMenu()
                  }
                  className="w-full flex justify-between items-center px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                >
                  {item.children ? (
                    <>
                      {item.label}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${activeMenu === item.label ? 'rotate-180' : ''}`}
                      />
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={closeMenu}
                      className="w-full text-left"
                    >
                      {item.label}
                    </Link>
                  )}
                </button>
                {item.children && activeMenu === item.label && (
                  <div className="ml-4 py-2 space-y-1">
                    {item.children.map(child => (
                      <Link
                        key={child.label}
                        to={child.href}
                        onClick={closeMenu}
                        className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-slate-200 space-y-1">
              <Link
                to="/about"
                onClick={closeMenu}
                className="block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
              >
                About
              </Link>
              <Link
                to="/search"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
