import React from 'react';
import { CreditProvider } from './contexts/CreditContext';
import HomePage from './components/HomePage';
import './App.css';

const App = () => {
  return (
    <CreditProvider>
      <HomePage />
    </CreditProvider>
  );
};

export default App;