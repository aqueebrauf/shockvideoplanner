import { Routes, Route, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/AppSidebar';
import Home from './pages/Home';
import Plan from './pages/Plan';
import Generator from './pages/Generator';
import Resources from './pages/Resources';
import Screens from './pages/resources/Screens';
import Hashtags from './pages/resources/Hashtags';
import Goals from './pages/resources/Goals';
import Ctas from './pages/resources/Ctas';
import Captions from './pages/resources/Captions';
import Characters from './pages/resources/Characters';

const pageTitles = {
  '/': 'Home',
  '/plan': 'Plan',
  '/generator': 'Generator',
  '/resources': 'Resources',
  '/resources/screens': 'Screens',
  '/resources/hashtags': 'Hashtags',
  '/resources/goals': 'Goals',
  '/resources/ctas': 'CTAs',
  '/resources/captions': 'Captions',
  '/resources/characters': 'Characters',
};

function getPageTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/resources')) return 'Resources';
  return 'Shock Video Planner';
}

export default function App() {
  const { pathname } = useLocation();
  const isPlanPage = pathname === '/plan';
  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center">
            <p className="text-sm font-medium">{pageTitle}</p>
          </div>
        </header>

        <main
          className={`flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6${
            isPlanPage ? ' max-w-none' : ' mx-auto w-full max-w-6xl'
          }`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/resources" element={<Resources />}>
              <Route index element={<Screens />} />
              <Route path="screens" element={<Screens />} />
              <Route path="hashtags" element={<Hashtags />} />
              <Route path="goals" element={<Goals />} />
              <Route path="ctas" element={<Ctas />} />
              <Route path="captions" element={<Captions />} />
              <Route path="characters" element={<Characters />} />
            </Route>
          </Routes>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
