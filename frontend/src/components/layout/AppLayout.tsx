import { NavLink, Outlet } from 'react-router-dom';
import { useLogout, useMe } from '../../api/auth';

export function AppLayout() {
  const { data: user } = useMe();
  const logout = useLogout();

  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-nav">
          <NavLink to="/" end>
            Board
          </NavLink>
          <NavLink to="/teams">Teams</NavLink>
          <NavLink to="/epics">Epics</NavLink>
        </nav>
        <div className="app-user">
          <span>{user?.email}</span>
          <button type="button" onClick={() => logout.mutate()}>
            Log out
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
