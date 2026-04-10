
import React, { useState } from 'react';

const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const phone = '23275510770';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message || 'Hello! I am interested in your services.')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-60">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden animate-bounce-in border border-slate-100">
          <div className="bg-lime-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-700">
                <i className="ri-whatsapp-line text-2xl"></i>
              </div>
              <div>
                <p className="font-bold text-sm">AA-Precision Chat</p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          <div className="p-4 bg-slate-50">
            <p className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-slate-700 mb-4">
              Hi there! 👋<br />Thanks for your interest in our precision services. How can we help you today?
            </p>
            <input 
              type="text" 
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-green-700"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <button 
            onClick={handleSend}
            className="w-full bg-green-700 text-white font-bold py-3 hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            Start Chat <i className="ri-whatsapp-line"></i>
          </button>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-lime-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95 text-3xl infinity-animate"
      >
        <i className={isOpen ? 'ri-close-line' : 'ri-whatsapp-line'}></i>
      </button>
    </div>
  );
};

export default WhatsAppWidget;
