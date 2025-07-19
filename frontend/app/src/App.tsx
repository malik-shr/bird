import { Routes, Route } from 'react-router';
import routes from './routes.tsx';
import MenuBar from './components/MenuBar.tsx';
import type { ReactNode } from 'react';
import Header from './components/Header.tsx';

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
    <div className="flex flex-col p-2">
      <Header />
      <div className="flex pt-15">
        <MenuBar />

        <main className="px-5 w-full">
          <Routes>{routesHTML}</Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
