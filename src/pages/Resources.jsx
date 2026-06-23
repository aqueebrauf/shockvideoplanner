import { NavLink, Outlet } from 'react-router-dom';

const resourceTabs = [
  { to: '/resources/screens', label: 'Screens' },
  { to: '/resources/hashtags', label: 'Hashtags' },
  { to: '/resources/goals', label: 'Goals' },
];

export default function Resources() {
  return (
    <>
      <h2 className="page-title">Resources</h2>
      <p className="page-subtitle">Reference data used when planning reels.</p>

      <nav className="sub-nav" aria-label="Resource sections">
        {resourceTabs.map((tab) => (
          <NavLink key={tab.label} to={tab.to}>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </>
  );
}
