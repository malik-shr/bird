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
      const body = new URLSearchParams();
      body.append('username', username);
      body.append('password', password);

      const data = await this.bird.send(`${this.baseUrl}/token`, {
        method: SendMethod.POST,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      localStorage.setItem('token', data.access_token);
      return data.token;
    } catch (e) {
      console.log(e);
    }
  }

  async verify() {
    const token = localStorage.getItem('token');

    try {
      const data = await this.bird.send(`${this.baseUrl}/verify_token`, {
        method: SendMethod.GET,
      });
    } catch (e) {
      localStorage.removeItem('token');
    }
  }

  logout() {
    localStorage.removeItem('token');
  }

  isAuth() {}
}
