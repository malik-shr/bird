import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';
import { NavLink } from 'react-router';

const Navbar = () => {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <div className="w-full p-5 border-1 border-gray-300 rounded-2xl shadow-sm flex justify-between items-center">
      <h1 className="text-3xl font-bold">Bird</h1>{' '}
      {isAuth ? (
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
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
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
