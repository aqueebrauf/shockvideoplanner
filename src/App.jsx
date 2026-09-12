import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/AppSidebar';
import ShowedMePlanHome from './pages/home/ShowedMePlanHome';
import ShowedMePlans from './pages/ShowedMePlans';
import ShowedMePlanDetail from './pages/ShowedMePlanDetail';
import GoalDemoLibrary from './pages/GoalDemoLibrary';
import Resources from './pages/Resources';
import Hashtags from './pages/resources/Hashtags';
import Goals from './pages/resources/Goals';
import Captions from './pages/resources/Captions';
import Characters from './pages/resources/Characters';
import Verbatims from './pages/resources/Verbatims';
import Hooks from './pages/resources/Hooks';
import ShowedMeHooks from './pages/resources/ShowedMeHooks';
import ThisPerson from './pages/resources/ThisPerson';

const pageTitles = {
  '/': 'Showed Me',
  '/generator': 'Showed Me',
  '/resources': 'Resources',
  '/resources/hashtags': 'Hashtags',
  '/resources/goals': 'Goals',
  '/resources/captions': 'Captions',
  '/resources/characters': 'Editors',
  '/resources/editors': 'Editors',
  '/resources/verbatims': 'Verbatims',
  '/resources/hooks': 'Hooks',
  '/resources/showed-me-hooks': 'Showed me hooks',
  '/resources/this-person': 'This person',
  '/resources/demo-library': 'Demo library',
};

function getPageTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/resources')) return 'Resources';
  if (pathname.startsWith('/generator')) return 'Showed Me';
  return 'Smash Video Planner';
}

export default function App() {
  const { pathname } = useLocation();
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

        <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 p-4 md:p-6">
          <Routes>
            <Route path="/" element={<ShowedMePlanHome />} />
            <Route path="/generator" element={<ShowedMePlans />} />
            <Route
              path="/generator/demo-library"
              element={<Navigate to="/resources/demo-library" replace />}
            />
            <Route path="/generator/character-walkthrough" element={<Navigate to="/generator" replace />} />
            <Route path="/generator/this-person" element={<Navigate to="/generator" replace />} />
            <Route path="/generator/:planId" element={<ShowedMePlanDetail />} />
            <Route path="/home/*" element={<Navigate to="/" replace />} />
            <Route path="/person-video-plans" element={<Navigate to="/generator" replace />} />
            <Route
              path="/person-video-plans/:planId"
              element={<Navigate to={`/generator/${pathname.split('/').pop()}`} replace />}
            />
            <Route path="/demo-library" element={<Navigate to="/resources/demo-library" replace />} />
            <Route path="/plan" element={<Navigate to="/generator" replace />} />
            <Route path="/resources" element={<Resources />}>
              <Route index element={<Hashtags />} />
              <Route path="screens" element={<Navigate to="/resources/hashtags" replace />} />
              <Route path="hashtags" element={<Hashtags />} />
              <Route path="goals" element={<Goals />} />
              <Route path="ctas" element={<Navigate to="/resources/hashtags" replace />} />
              <Route path="captions" element={<Captions />} />
              <Route path="characters" element={<Navigate to="/resources/editors" replace />} />
              <Route path="editors" element={<Characters />} />
              <Route path="verbatims" element={<Verbatims />} />
              <Route path="hooks" element={<Hooks />} />
              <Route path="showed-me-hooks" element={<ShowedMeHooks />} />
              <Route path="this-person" element={<ThisPerson />} />
              <Route path="demo-library" element={<GoalDemoLibrary />} />
            </Route>
          </Routes>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
