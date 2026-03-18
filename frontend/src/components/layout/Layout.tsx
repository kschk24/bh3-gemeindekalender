import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import EventDetailModal from '../events/EventDetailModal';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
      <Header />
      <div className="flex-1 flex">
        <main
          id="main-content"
          className="flex-1 container mx-auto px-4 py-8 lg:pr-20"
          role="main"
          tabIndex={-1}
        >
          {children}
        </main>
        <Sidebar />
      </div>
      <Footer />
      <EventDetailModal />
    </div>
  );
}
