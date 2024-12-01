import React, { createContext, ReactNode } from 'react';
import useLanguages, { Language } from '../hooks/useLanguages';

interface LanguageContextProps {
  languages: Language[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export const LanguageContext = createContext<LanguageContextProps>({
  languages: undefined,
  isLoading: false,
  isError: false,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: languages, isLoading, isError } = useLanguages();

  return (
    <LanguageContext.Provider value={{ languages, isLoading, isError }}>
      {children}
    </LanguageContext.Provider>
  );
};
