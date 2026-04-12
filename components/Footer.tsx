
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const footerLogo = new URL('../src/assets/AAP LOGO w.png', import.meta.url).href;

const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubscribeMessage('');

    try {
      // MailerLite API configuration
      const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiNWUwMjhjMDVlODhlZjBlZjhjYzRhNWZiNWU3ZTRhNjE5ZjM4NjE4YzZhNTZjYjEzZmI2N2EwNTEzMDMwOGVkZjVmZDliNDE0OTcwZTVhYjUiLCJpYXQiOjE3NzU5MjExMjguMjk3MTQ3LCJuYmYiOjE3NzU5MjExMjguMjk3MTUsImV4cCI6NDkzMTU5NDcyOC4yODk1MDEsInN1YiI6IjIyNTk3NzAiLCJzY29wZXMiOltdfQ.m_Uofcvm2HPxpO9iB3c_JscROpYBsvXTxgOdnPhJGh34gfrBQj92OG1CUdDDlAulEjbV6kjke6LkD-S7v8Ya-EeoYLk2wPzfPg4QGWcE0AY8Oy6ijuFFeczLO15mtjd2jUpp6ZZLuSoN-k_jvOKyJF6peZ2czoV6RPG0Kqkw8lEBIaGpSiMe7uys9hfoafZDay0uvqIZWjE-c43syG7fO-EhcRxu6S6lGe0L69Zt2-uwTWvZHKPHXi77f3eepiKzw2Xq_NWqVjS--C4MbBmHru4uEZVOrEFzRGZGTl9pJc4TIpA5CTnknsCZIBT7iW3BuVuh1uZVe-sol9q92vh-88YZrWEy2gN3BhKyM9g6z6NecOdk7a5naJXbW4g-5V2GMlSvZpDPf-lYzLLVZ0ihAs1Cisl6nVM80NObHLWvHdJKtYTDaXJeBkui5RP6k_U7fpUGiIlhw9ccX0gY30UeGLVedX0nbmOtblv527SHZHoUGCXHKLxRLQqUwE0IFue0DbAEZEpaDTv6EanrxuZc6zGa899HRmAKRwyiGyvm3LlffiyE5_fhvdWkRMkGqLX35fhjUe6MlsTrQ7gwlXvcmGOoMZQQNdZo5WP_yWjGa1h7crDxYffbIL8Pm2JZ89yCa4l6V9KoW2JaHDcCZfM--dPRficnpyQLNtmtWBoZQzI'; // Replace with your MailerLite API key
      const GROUP_ID = '184458818206303987'; // Replace with your MailerLite group ID

      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          email: newsletterEmail,
          groups: [GROUP_ID]
        })
      });

      if (response.ok) {
        setSubscribeMessage('Successfully subscribed! Welcome to our newsletter.');
        setNewsletterEmail('');
      } else {
        const errorData = await response.json();
        setSubscribeMessage(errorData.message || 'Failed to subscribe. Please try again.');
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
            <img src={footerLogo} alt="Agro Aerial Precision Logo" className="w-12 " />
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
