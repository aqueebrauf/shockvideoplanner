import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Generator from './pages/Generator';
import Resources from './pages/Resources';
import Screens from './pages/resources/Screens';
import Hashtags from './pages/resources/Hashtags';
import Goals from './pages/resources/Goals';

function NavIcon({ children }) {
  return <span aria-hidden="true">{children}</span>;
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Shock Video Planner</h1>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/resources" element={<Resources />}>
            <Route index element={<Screens />} />
            <Route path="screens" element={<Screens />} />
            <Route path="hashtags" element={<Hashtags />} />
            <Route path="goals" element={<Goals />} />
          </Route>
        </Routes>
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        <NavLink to="/" end>
          <NavIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </NavIcon>
          Home
        </NavLink>
        <NavLink to="/generator">
          <NavIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
              <path d="M8 8l2 2M14 14l2 2M16 8l-2 2M8 16l2-2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </NavIcon>
          Generator
        </NavLink>
        <NavLink to="/resources">
          <NavIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </NavIcon>
          Resources
        </NavLink>
      </nav>
    </div>
  );
}
