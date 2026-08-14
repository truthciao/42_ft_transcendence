import type { Server } from 'node:http';
import request from 'supertest';

interface TestUser {
  email: string;
  username: string;
  password: string;
}

export async function registerAndLogin(
  server: Server,
  user: TestUser,
): Promise<string> {
  await request(server)
    .post('/auth/register')
    .send(user)
    .expect(201);

  const response = await request(server)
    .post('/auth/login')
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(200);

  return response.body.access_token as string;
}