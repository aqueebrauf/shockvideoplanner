import { NavLink, Outlet, useLocation } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const resourceTabs = [
  { to: '/resources/screens', label: 'Screens' },
  { to: '/resources/hashtags', label: 'Hashtags' },
  { to: '/resources/goals', label: 'Goals' },
  { to: '/resources/ctas', label: 'CTAs' },
  { to: '/resources/captions', label: 'Captions' },
  { to: '/resources/characters', label: 'Characters' },
];

export default function Resources() {
  const { pathname } = useLocation();
  const activeTab =
    resourceTabs.find((tab) => pathname.startsWith(tab.to))?.to ?? '/resources/screens';

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
