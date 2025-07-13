import { Routes, Route } from 'react-router';
import routes from './routes.tsx';
import Sidebar from './components/Sidebar.tsx';
import type { ReactNode } from 'react';

function App() {
  const routesHTML: Array<ReactNode> = routes.map((route) => {
    return (
      <Route
        key={route.path}
        path={route.path}
        element={route.component}
      ></Route>
    );
  });

  return (
    <div className="flex">
      <Sidebar />

      <main className="p-10">
        <Routes>{routesHTML}</Routes>
      </main>
    </div>
  );
}

export default App;
