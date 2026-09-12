import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { PlanProvider } from './hooks/usePlan';
import { PersonVideoPlanProvider } from './hooks/usePersonVideoPlans';
import { ResourcesProvider } from './providers/ResourcesProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <PlanProvider>
        <PersonVideoPlanProvider>
          <ResourcesProvider>
            <TooltipProvider>
              <App />
            </TooltipProvider>
          </ResourcesProvider>
        </PersonVideoPlanProvider>
      </PlanProvider>
    </HashRouter>
  </StrictMode>
);
