import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontScale = '100' | '110' | '125' | '150';

interface AccessibilityContextType {
  fontScale: FontScale;
  highContrast: boolean;
  setFontScale: (scale: FontScale) => void;
  setHighContrast: (enabled: boolean) => void;
  announceMessage: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScaleState] = useState<FontScale>(() => {
    const stored = localStorage.getItem('fontScale');
    return (stored as FontScale) || '100';
  });

  const [highContrast, setHighContrastState] = useState(() => {
    return localStorage.getItem('highContrast') === 'true';
  });

  // Live region for screen reader announcements
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    document.documentElement.classList.remove(
      'font-scale-100',
      'font-scale-110',
      'font-scale-125',
      'font-scale-150'
    );
    document.documentElement.classList.add(`font-scale-${fontScale}`);
  }, [fontScale]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const setFontScale = (scale: FontScale) => {
    setFontScaleState(scale);
    localStorage.setItem('fontScale', scale);
    announceMessage(`Schriftgröße auf ${scale}% geändert`);
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem('highContrast', String(enabled));
    announceMessage(enabled ? 'Hoher Kontrast aktiviert' : 'Hoher Kontrast deaktiviert');
  };

  const announceMessage = (message: string) => {
    setAnnouncement('');
    // Small delay to ensure screen readers pick up the change
    setTimeout(() => setAnnouncement(message), 100);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        highContrast,
        setFontScale,
        setHighContrast,
        announceMessage,
      }}
    >
      {children}
      {/* Live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
