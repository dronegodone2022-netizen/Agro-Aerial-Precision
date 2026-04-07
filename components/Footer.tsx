
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-950 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* About */}
        <div>
          <div className="flex items-center flex-col gap-2 mb-6">
            <img src="public/AAP LOGO w.png" alt="Agro Aerial Precision Logo" className="w-12 " />
            <span className="font-bold text-white text-xl">Agro Aerial Precision</span>
          </div>
          <p className="text-slate-400 mb-6">
            Pioneering precision agriculture and industrial inspection through advanced drone technology and data intelligence.
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/AgroAerialPrecision/" className="w-10 h-10 rounded-full bg-lime-800 flex items-center justify-center hover:bg-blue-800 hover:text-white transition-colors">
              <i className="ri-facebook-fill"></i>
            </a>
           
            <a href="https://www.linkedin.com/company/agro-aerial-precision/" className="w-10 h-10 rounded-full bg-lime-800 flex items-center justify-center hover:bg-blue-900 hover:text-white transition-colors">
              <i className="ri-linkedin-fill"></i>
            </a>
            <a href="https://www.youtube.com/@agroaerialprecision232" className="w-10 h-10 rounded-full bg-lime-800 flex items-center justify-center hover:bg-red-700 hover:text-white transition-colors">
              <i className="ri-youtube-fill"></i>
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="ml-4">
          <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
          <ul className="flex flex-col gap-4">
            <li><Link to="/" className="hover:text-lime-500 transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-lime-500 transition-colors">About Us</Link></li>
            <li><Link to="/academy" className="hover:text-lime-500 transition-colors">OUR ACODEMY</Link></li>
            <li><Link to="/services" className="hover:text-lime-500 transition-colors">Our Services</Link></li>
            <li><Link to="/contact" className="hover:text-lime-500 transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-white font-bold text-lg mb-6">Our Solutions</h4>
          <ul className="flex flex-col gap-4">
            <li><Link to="/services/agriculture" className="hover:text-lime-500 transition-colors">Agriculture</Link></li>
            <li><Link to="/services/inspection" className="hover:text-lime-500 transition-colors">Asset Inspection</Link></li>
            <li><Link to="/services/mining" className="hover:text-lime-500 transition-colors">Mining Solutions</Link></li>
            <li><Link to="/services/health" className="hover:text-lime-500 transition-colors">Health & Environment</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-bold text-lg mb-6">Newsletter</h4>
          <p className="text-sm text-slate-400 mb-4">Stay updated with the latest in precision agriculture.</p>
          <form action="https://api.web3forms.com/submit" method="POST" className="flex flex-col gap-2">
            <input type="hidden" name="access_key" value="1fa81b81-fe27-43db-a1f6-5aa4821adfaa" />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-500"
            />
            <button
              type="submit"
              className="bg-lime-500 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              Subscribe <i className="ri-send-plane-fill"></i>
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-white flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>&copy; 2026 Agro Aerial Precision. All rights reserved.</p>
        <div className="flex gap-8">
          <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
