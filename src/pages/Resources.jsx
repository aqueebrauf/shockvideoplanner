import { NavLink, Outlet } from 'react-router-dom';

const resourceTabs = [
  { to: '/resources/screens', label: 'Screens', active: true },
  { to: '#', label: 'Hashtags', active: false },
];

export default function Resources() {
  return (
    <>
      <h2 className="page-title">Resources</h2>
      <p className="page-subtitle">Reference data used when planning reels.</p>

      <nav className="sub-nav" aria-label="Resource sections">
        {resourceTabs.map((tab) =>
          tab.active ? (
            <NavLink key={tab.label} to={tab.to} end>
              {tab.label}
            </NavLink>
          ) : (
            <span key={tab.label} className="disabled" aria-disabled="true">
              {tab.label}
            </span>
          )
        )}
      </nav>

      <Outlet />
    </>
  );
}
