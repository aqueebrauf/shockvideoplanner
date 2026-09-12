import { NavLink, Outlet, useLocation } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const resourceTabs = [
  { to: '/resources/hashtags', label: 'Hashtags' },
  { to: '/resources/goals', label: 'Goals' },
  { to: '/resources/captions', label: 'Captions' },
  { to: '/resources/characters', label: 'Characters' },
  { to: '/resources/verbatims', label: 'Verbatims' },
  { to: '/resources/hooks', label: 'Hooks' },
  { to: '/resources/showed-me-hooks', label: 'Showed me hooks' },
  { to: '/resources/this-person', label: 'This person' },
  { to: '/resources/demo-library', label: 'Demo library' },
];

export default function Resources() {
  const { pathname } = useLocation();
  const activeTab =
    resourceTabs.find((tab) => pathname.startsWith(tab.to))?.to ?? '/resources/hashtags';

  return (
    <>
      <PageHeader
        title="Resources"
        description="Reference data used when planning reels."
      />

      <Tabs value={activeTab} className="mb-6">
        <TabsList variant="line">
          {resourceTabs.map((tab) => (
            <TabsTrigger key={tab.to} value={tab.to} render={<NavLink to={tab.to} />}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Outlet />
    </>
  );
}
