import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { PlanProvider } from './hooks/usePlan';
import { TooltipProvider } from '@/components/ui/tooltip';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <PlanProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </PlanProvider>
    </HashRouter>
  </StrictMode>
);
