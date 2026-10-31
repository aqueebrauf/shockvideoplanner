import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

const resourceTabs = [
  { to: '/resources/hashtags', label: 'Hashtags' },
  { to: '/resources/goals', label: 'Goals' },
  { to: '/resources/captions', label: 'Captions' },
  { to: '/resources/editors', label: 'Editors' },
  { to: '/resources/verbatims', label: 'Verbatims' },
  { to: '/resources/hooks', label: 'Hooks' },
  { to: '/resources/showed-me-hooks', label: 'Showed me hooks' },
  { to: '/resources/this-person', label: 'This person' },
  { to: '/resources/demo-library', label: 'Demo library' },
  { to: '/resources/viral-formats', label: 'Viral formats' },
];

export default function Resources() {
  return (
    <>
      <PageHeader
        title="Resources"
        description="Reference data used when planning reels."
      />

      <nav className="mb-6 flex flex-wrap gap-x-4 gap-y-2 border-b pb-2">
        {resourceTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'text-sm font-medium text-foreground/60 hover:text-foreground',
                isActive && 'text-foreground underline decoration-2 underline-offset-8'
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </>
  );
}
