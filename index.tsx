
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// The site used to have addresses like "/#/about". Turn old links (bookmarks, emails,
// QR codes on printed certificates) into the new clean addresses, e.g. "/about".
// Old email links could also carry "?code=..." before the "#".
const { hash, search, pathname } = window.location;
if (hash.startsWith('#/')) {
  const base = import.meta.env.BASE_URL;
  const [route, routeQuery = ''] = hash.slice(2).split('?');
  const query = [search.replace(/^\?/, ''), routeQuery].filter(Boolean).join('&');
  const onBasePath = pathname === base || pathname === base.replace(/\/$/, '') || pathname === `${base}index.html`;
  if (onBasePath) {
    window.history.replaceState(null, '', `${base}${route}${query ? `?${query}` : ''}`);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
