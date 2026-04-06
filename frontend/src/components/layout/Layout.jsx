// Layout.jsx — Main authenticated layout (sidebar + content)
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useLanguage } from '../../context/LanguageContext';

const PAGE_TITLES = {
  '/dashboard': 'dashboard',
  '/diagnosis':  'diagnosisTitle',
  '/history':    'historyTitle',
  '/admin':      'adminTitle',
};

export default function Layout() {
  const location = useLocation();
  const { t } = useLanguage();

  const titleKey = PAGE_TITLES[location.pathname] || 'appName';
  const title = t[titleKey] || t.appName;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar title={title} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}