import { useState, type FormEventHandler } from 'react';
import { NavLink } from 'react-router';
import { bird } from '../lib/lib';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();

    bird.auth.login(email, password);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            className="input"
            value={email}
            type="text"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            className="input"
            value={password}
            type="password"
            id="password"
            onChange={(e: any) => setPassword(e.target.value)}
          />
        </div>
        <input
          className="btn btn-primary w-full mt-5"
          type="submit"
          value="Login"
        />
      </form>

      <p className="mt-5">
        <NavLink to="/register">No Account?</NavLink>
      </p>
    </div>
  );
};

export default Login;
