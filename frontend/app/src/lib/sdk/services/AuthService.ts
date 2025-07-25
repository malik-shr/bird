import type { User } from '../../../types/types';
import type Bird from '../Bird';
import { SendMethod } from '../Bird';

export class AuthService {
  bird: Bird;
  baseUrl: string;

  constructor(bird: Bird) {
    this.bird = bird;
    this.baseUrl = `${this.bird.url}/api/auth`;
  }

  async login(username: string, password: string) {
    try {
      console.log(username);
      console.log(password);
      const data = await this.bird.send(`${this.baseUrl}/login`, {
        method: SendMethod.POST,
        headers: {
          'Content-Type': 'application/json',
        },
        body: { username: username, password: password },
      });

      console.log(data.access_token);

      localStorage.setItem('token', String(data.access_token));
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  async verify() {
    const token = localStorage.getItem('token');
    console.log(token);

    if (!token) {
      throw new Error('No token found');
    }

    try {
      const data = await this.bird.send(`${this.baseUrl}/me`, {
        method: SendMethod.GET,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (e) {
      console.error('Verification failed', e);
      localStorage.removeItem('token');
      throw e;
    }
  }

  async logout() {
    localStorage.removeItem('token');
  }
}
