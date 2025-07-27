import { Routes, Route, useLocation } from 'react-router';
import routes from './routes.tsx';
import MenuBar from './components/MenuBar.tsx';
import { type ReactNode } from 'react';
import Navbar from './components/Navbar.tsx';
import { AuthProvider } from './providers/AuthProvider.tsx';

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

  const location = useLocation();

  return (
    <div className="flex flex-col p-2">
      {location.pathname === '/login' || location.pathname === '/register' ? (
        <main className="px-5 w-full">
          <Routes>{routesHTML}</Routes>
        </main>
      ) : (
        <AuthProvider>
          <div>
            <Navbar />
            <div className="flex pt-15">
              <MenuBar />

              <main className="px-5 w-full">
                <Routes>{routesHTML}</Routes>
              </main>
            </div>
          </div>
        </AuthProvider>
      )}
    </div>
  );
}

export default App;
