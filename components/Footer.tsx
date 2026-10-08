
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { INDUSTRIES } from '../constants';

const footerLogo = new URL('../src/assets/AAP LOGO w.png', import.meta.url).href;

// Account ID matches the MailerLite Universal script in index.html.
// Form ID comes from MailerLite > Forms > Embedded forms > (your form) > HTML code.
const MAILERLITE_ACCOUNT_ID = '2239723';
const MAILERLITE_FORM_ID = import.meta.env.VITE_MAILERLITE_FORM_ID?.trim() || '';

const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubscribeMessage('');

    try {
      // Public MailerLite embedded-form endpoint. Never put a MailerLite API key in frontend code:
      // everything in this bundle is visible to every visitor.
      if (!MAILERLITE_FORM_ID) {
        setSubscribeMessage('Newsletter sign-up is not available right now. Please try again later.');
        return;
      }

      const formData = new FormData();
      formData.append('fields[email]', newsletterEmail);
      formData.append('ml-submit', '1');
      formData.append('anticsrf', 'true');

      const response = await fetch(
        `https://assets.mailerlite.com/jsonp/${MAILERLITE_ACCOUNT_ID}/forms/${MAILERLITE_FORM_ID}/subscribe`,
        { method: 'POST', body: formData }
      );
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success !== false) {
        setSubscribeMessage('Successfully subscribed! Welcome to our newsletter.');
        setNewsletterEmail('');
      } else {
        setSubscribeMessage('Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setSubscribeMessage('Network error. Please try again later.');
    } finally {
      setIsSubscribing(false);
    }
  };
  return (
    <footer className="bg-green-950 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* About */}
        <div>
          <div className="flex items-center flex-col gap-2 mb-6">
            <img loading="lazy" src={footerLogo} alt="Agro Aerial Precision Logo" className="w-12 " />
            <span className="font-bold text-white text-xl">Agro Aerial Precision</span>
          </div>
          <p className="text-slate-400 mb-6">
            Drone surveys, inspection and aerial data for mining, construction, infrastructure and agriculture - and the academy that trains Sierra Leone's drone professionals.
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
            <li><Link to="/academy" className="hover:text-lime-500 transition-colors">Our Academy</Link></li>
            <li><Link to="/services" className="hover:text-lime-500 transition-colors">Our Services</Link></li>
            <li><Link to="/contact" className="hover:text-lime-500 transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-white font-bold text-lg mb-6">Our Solutions</h4>
          <ul className="flex flex-col gap-4">
            {INDUSTRIES.map((industry) => (
              <li key={industry.slug}>
                <Link to={`/services/${industry.slug}`} className="hover:text-lime-500 transition-colors">{industry.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-bold text-lg mb-6">Newsletter</h4>
          <p className="text-sm text-slate-400 mb-4">Stay updated on drone surveying, inspection, training and aerial data.</p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-500"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="bg-lime-500 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'} <i className="ri-send-plane-fill"></i>
            </button>
            {subscribeMessage && (
              <p className={`text-sm mt-2 ${subscribeMessage.includes('Successfully') ? 'text-green-400' : 'text-red-400'}`}>
                {subscribeMessage}
              </p>
            )}
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
