import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const STORAGE_KEY = 'liwilu_mayorista_mode';

interface MayoristaContextType {
  isMayorista: boolean;
  enableMayorista: () => void;
  disableMayorista: () => void;
}

const MayoristaContext = createContext<MayoristaContextType>({
  isMayorista: false,
  enableMayorista: () => {},
  disableMayorista: () => {},
});

export function MayoristaProvider({ children }: { children: ReactNode }) {
  const [isMayorista, setIsMayorista] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setIsMayorista(true);
    }
  }, []);

  const enableMayorista = () => {
    setIsMayorista(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const disableMayorista = () => {
    setIsMayorista(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <MayoristaContext.Provider value={{ isMayorista, enableMayorista, disableMayorista }}>
      {children}
    </MayoristaContext.Provider>
  );
}

export const useMayorista = () => useContext(MayoristaContext);
