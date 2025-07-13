import { type ReactElement } from 'react';
import Home from './pages/Home';
import Collections from './pages/Collections';
import Collection from './pages/Colection';

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
    path: '/collections',
    component: <Collections />,
  },
  {
    path: '/collections/:collectionName',
    component: <Collection />,
  },
];

export default routes;
