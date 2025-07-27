import { type ReactElement } from 'react';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

interface IRoute {
  path: string;
  component: ReactElement;
}

const routes: IRoute[] = [
  {
    path: '/',
    component: <Home />,
  },
  {
    path: '/settings',
    component: <Settings />,
  },
  {
    path: '/login',
    component: <Login />,
  },
  {
    path: '/register',
    component: <Register />,
  },
];

export default routes;
