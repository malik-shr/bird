import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Bird } from '../Bird';
import { SendMethod } from '../Bird';

export class AuthService {
  bird: Bird;
  baseUrl: string;

  constructor(bird: Bird) {
    this.bird = bird;
    this.baseUrl = `${this.bird.url}/api/auth`;
  }

  async register(
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) {
    try {
      await this.bird.send(`${this.baseUrl}/register`, {
        method: SendMethod.POST,
        headers: {
          'Content-Type': 'application/json',
        },
        body: { username, email, password, confirmPassword },
      });
    } catch (e) {
      console.error('Register:', e);
    }
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
    } catch (e) {
      console.error('Login error:', e);
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

  async subscribe(onMessage: (event: any) => void) {
    const token = localStorage.getItem('token');

    await fetchEventSource(`${this.baseUrl}/realtime`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onmessage(msg) {
        const parsed = JSON.parse(msg.data);
        onMessage(parsed);
      },
    });
  }

  async logout() {
    localStorage.removeItem('token');
  }
}
