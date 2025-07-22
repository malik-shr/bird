import { useState } from 'react';

const Register = () => {
  const [email, setEmail] = useState();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();

  return (
    <div className="flex flex-col justify-center items-center">
      <div>
        <label htmlFor="email">Email</label>
        <input className="input" value={email} type="text" id="email" />
      </div>
      <div>
        <label htmlFor="username">Username</label>
        <input className="input" value={username} type="text" id="username" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          className="input"
          value={password}
          type="password"
          id="password"
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
    </div>
  );
};

export default Register;
