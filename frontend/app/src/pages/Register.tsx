import { useState } from 'react';
import { bird } from '../lib/lib';

const Register = () => {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await bird.collection('users').create({
      email: email,
      username: username,
      password: password,
      disabled: false,
      role: 5,
    });
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
          <label htmlFor="username">Username</label>
          <input
            className="input"
            value={username}
            type="text"
            id="username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            className="input"
            value={password}
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            className="input"
            value={confirmPassword}
            type="password"
            id="confirmPassword"
          />
        </div>
        <input
          type="submit"
          value="Register"
          className="btn btn-primary w-full mt-10"
        />
      </form>
    </div>
  );
};

export default Register;
