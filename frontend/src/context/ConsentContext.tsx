import { createContext, useContext, useState, ReactNode } from 'react';

type ConsentStatus = 'accepted' | 'rejected' | null;

interface ConsentContextType {
  consent: ConsentStatus;
  accept: () => void;
  reject: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

const STORAGE_KEY = 'cookie_consent';

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentStatus>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ConsentStatus) ?? null;
  });

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsent('accepted');
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setConsent('rejected');
  };

  return (
    <ConsentContext.Provider value={{ consent, accept, reject }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error('useConsent must be used within ConsentProvider');
  return context;
}
