import React, { createContext, useContext, useState } from 'react';

// Utworzenie kontekstu dla kredytów
export const CreditContext = createContext();

// Hook do użycia kredytów (opcjonalny, ale ułatwia używanie kontekstu)
export const useCredits = () => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};

// Provider komponent dla kredytów
export const CreditProvider = ({ children }) => {
  const [credits, setCredits] = useState(1000); // Początkowa wartość kredytów

  // Możesz dodać tutaj dodatkowe funkcje do zarządzania kredytami
  const addCredits = (amount) => {
    setCredits(prev => prev + amount);
  };

  const removeCredits = (amount) => {
    setCredits(prev => prev - amount);
  };

  // Wartości i funkcje, które chcesz udostępnić w kontekście
  const value = {
    credits,
    setCredits,
    addCredits,
    removeCredits
  };

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
};