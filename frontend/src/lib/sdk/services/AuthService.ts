import { Bird } from '../Bird';
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
      const data = await this.bird.send(`${this.baseUrl}/login`, {
        method: SendMethod.POST,
        headers: {
          'Content-Type': 'application/json',
        },
        body: { username: username, password: password },
      });

      localStorage.setItem('token', String(data.access_token));
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  async verify(): Promise<Bird.User> {
    const token = localStorage.getItem('token');

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

      return data.user;
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
