import { Icon } from '@iconify/react/dist/iconify.js';
import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../providers/AuthProvider';
import { bird } from '../lib/lib';

const Navbar = () => {
  const { currentUser } = useAuth();

  const navigate = useNavigate();

  const logout = async () => {
    await bird.auth.logout();
    navigate('/login');
  };

  useEffect(() => {
    const verify = async () => {
      const result = await bird.auth.verify();
      navigate(result ? '/' : '/login');
    };
    verify();
  }, []);

  return (
    <div className="w-full p-5 border-1 border-gray-300 rounded-2xl shadow-sm flex justify-between items-center">
      <h1 className="text-3xl font-bold">Bird</h1>{' '}
      {currentUser ? (
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="cursor-pointer">
            <div className="flex justify-center items-center bg-white p-3 rounded-full text-2xl">
              <Icon icon="ri:user-3-fill" />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <span className="mb-2">
              <h4>{currentUser.email}</h4>
              <span>@{currentUser.username}</span>
            </span>

            <li onClick={logout}>
              <a>Logout</a>
            </li>
          </ul>
        </div>
      ) : (
        <button className="btn btn-primary">
          <NavLink to="login">Login</NavLink>
        </button>
      )}
    </div>
  );
};

export default Navbar;
