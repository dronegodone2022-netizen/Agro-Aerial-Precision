import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';

const logoSrc = new URL('../src/assets/AAPLOGO.png', import.meta.url).href;

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on actual route change (pathname)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isOpen ? 'hidden' : prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <header className={`fixed  top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-lime-600 shadow-md py-2': 'bg-transparent py-4'} text-white`}>
      <nav className="container h-12 mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={(e) => {
          if (location.pathname === '/') {
            e.preventDefault();
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
          }
          setIsOpen(false);
        }}>
        <div className="w-32 h-70 overflow-hidden shrink-0">
          <img src={logoSrc} alt="Agro Aerial Precision company logo with stylized text and agricultural drone imagery, representing precision aerial services for farming" className={`min-w-32 h-full object-contain ${scrolled ? 'brightness-0 invert' : ''}`} />
        </div>
          <span className={`font-bold text-sm sm:text-base lg:text-xl hidden sm:block ${scrolled ? 'text-slate-900' : 'text-lime-300'}`}>
      
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-4 lg:gap-8">
          {NAV_LINKS.map((link) => (
        <li key={link.path} className="relative group">
            <Link 
            to={link.path} 
            className={`font-medium transition-all duration-300 ease-in-out hover:text-white flex items-center gap-1 text-sm lg:text-base ${scrolled ? 'text-white hover:text-lime-900' : 'text-lime-600 hover:text-lime-300'}`}
            >
            {link.label}
            {link.dropdown && <i className="ri-arrow-down-s-line"></i>}
            </Link>
          
          {link.dropdown && (
            <ul className="absolute left-0 top-full mt-2 w-44 lg:w-48 bg-lime-600 shadow-xl rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 ease-in-out transform -translate-y-1 group-hover:translate-y-0">
              {link.dropdown.map((sub) => (
                <li key={sub.path} className="transition-colors duration-300">
                  <Link to={sub.path} className="block px-3 lg:px-4 py-2 text-sm lg:text-base text-white hover:bg-lime-50 hover:text-green-800 transition-colors duration-300">
                    {sub.label}
                  </Link>
                </li> 
              ))}
            </ul>
          )}
        </li>
          ))}
          <li>
        <Link
          to="/contact"
          onClick={() => setIsOpen(false)}
          className="bg-green-900 text-white px-4 lg:px-6 py-2 rounded-full font-semibold text-sm lg:text-base hover:bg-lime-800 transition-colors"
        >
          Contact Us
        </Link>
          </li>
        </ul>

        <button 
          className={`md:hidden text-3xl sm:text-4xl p-2 transition-colors z-50 ${scrolled ? 'text-green-950' : 'text-lime-600'}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <i className={isOpen ? 'ri-close-line' : 'ri-menu-4-line'}></i>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-lime-100 z-40 transition-transform duration-300 md:hidden text-green-950 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col p-8 pt-24 gap-6 h-full">
          {NAV_LINKS.map((link) => (
            <div key={link.path} className="flex flex-col gap-2">
              <Link to={link.path} onClick={() => setIsOpen(false)} className="text-2xl font-bold text-slate-800 hover:text-green-600">
                {link.label}
              </Link>
              {link.dropdown && (
                <div className="pl-4 flex flex-col gap-2 border-l-2 border-lime-400">
                  {link.dropdown.map((sub) => (
                    <Link key={sub.path} to={sub.path} onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-green-600">
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="mt-auto pb-12">
             <div className="flex gap-4 text-3xl mb-6">
                <a href="https://www.linkedin.com/company/agro-aerial-precision/" className="text-blue-400"><i className="ri-linkedin-box-fill"></i></a>
                <a href="https://www.youtube.com/@agroaerialprecision232" className="text-red-600"><i className="ri-youtube-fill"></i></a>
                 <a href="https://www.facebook.com/AgroAerialPrecision/" className="text-blue-600"><i className="ri-facebook-box-fill"></i></a>
             </div>
            <a
              href="mailto:info@aaprecision.llc"
              className="block text-center bg-green-800 text-white py-4 rounded-xl font-bold hover:bg-lime-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Get Free Consultation
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;