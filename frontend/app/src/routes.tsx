import { type ReactElement } from 'react';
import Home from './pages/Home';
import Settings from './pages/Settings';

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
];

export default routes;
