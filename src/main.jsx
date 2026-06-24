import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { PlanProvider } from './hooks/usePlan';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <PlanProvider>
        <App />
      </PlanProvider>
    </HashRouter>
  </StrictMode>
);
