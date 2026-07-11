import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';

describe('Ticketing business flow (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;

  const email = `e2e-${randomUUID()}@example.com`;
  const password = 'password123';
  const teamName = `E2E Team ${randomUUID()}`;

  let authCookie: string;
  let teamId: string;
  let epicId: string;
  let ticketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.setGlobalPrefix('api');
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated access to protected routes', async () => {
    await request(server).get('/api/teams').expect(401);
  });

  it('signs up and logs in', async () => {
    await request(server).post('/api/auth/signup').send({ email, password }).expect(201);

    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    const setCookie = loginRes.headers['set-cookie'] as unknown as string[];
    expect(setCookie).toBeDefined();
    authCookie = setCookie[0];
  });

  it('rejects duplicate signup with a case-insensitive email match', async () => {
    await request(server)
      .post('/api/auth/signup')
      .send({ email: email.toUpperCase(), password })
      .expect(409);
  });

  it('creates a team', async () => {
    const res = await request(server)
      .post('/api/teams')
      .set('Cookie', authCookie)
      .send({ name: teamName })
      .expect(201);
    teamId = res.body.id;
    expect(res.body.name).toBe(teamName);
  });

  it('rejects a duplicate team name case-insensitively', async () => {
    await request(server)
      .post('/api/teams')
      .set('Cookie', authCookie)
      .send({ name: teamName.toUpperCase() })
      .expect(409);
  });

  it('creates an epic under the team', async () => {
    const res = await request(server)
      .post('/api/epics')
      .set('Cookie', authCookie)
      .send({ teamId, title: 'E2E Epic' })
      .expect(201);
    epicId = res.body.id;
  });

  it('creates a ticket under the team and epic', async () => {
    const res = await request(server)
      .post('/api/tickets')
      .set('Cookie', authCookie)
      .send({ teamId, epicId, type: 'feature', title: 'E2E ticket', body: 'Body text' })
      .expect(201);
    ticketId = res.body.id;
    expect(res.body.state).toBe('new');
    expect(res.body.createdBy.email).toBe(email);
  });

  it('blocks deleting a team that still has epics/tickets', async () => {
    await request(server).delete(`/api/teams/${teamId}`).set('Cookie', authCookie).expect(409);
  });

  it('blocks deleting an epic still referenced by a ticket', async () => {
    await request(server).delete(`/api/epics/${epicId}`).set('Cookie', authCookie).expect(409);
  });

  it('does not bump modifiedAt on a no-op save, but does on a real state change', async () => {
    const before = await request(server)
      .get(`/api/tickets/${ticketId}`)
      .set('Cookie', authCookie)
      .expect(200);

    const noOp = await request(server)
      .patch(`/api/tickets/${ticketId}`)
      .set('Cookie', authCookie)
      .send({ title: before.body.title })
      .expect(200);
    expect(noOp.body.updatedAt).toBe(before.body.updatedAt);

    await new Promise((resolve) => setTimeout(resolve, 10));

    const moved = await request(server)
      .patch(`/api/tickets/${ticketId}`)
      .set('Cookie', authCookie)
      .send({ state: 'in_progress' })
      .expect(200);
    expect(moved.body.state).toBe('in_progress');
    expect(new Date(moved.body.updatedAt).getTime()).toBeGreaterThan(
      new Date(before.body.updatedAt).getTime(),
    );
  });

  it('adds a comment without changing the ticket modifiedAt', async () => {
    const before = await request(server)
      .get(`/api/tickets/${ticketId}`)
      .set('Cookie', authCookie)
      .expect(200);

    await request(server)
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Cookie', authCookie)
      .send({ body: 'Looks good' })
      .expect(201);

    const comments = await request(server)
      .get(`/api/tickets/${ticketId}/comments`)
      .set('Cookie', authCookie)
      .expect(200);
    expect(comments.body).toHaveLength(1);
    expect(comments.body[0].body).toBe('Looks good');

    const after = await request(server)
      .get(`/api/tickets/${ticketId}`)
      .set('Cookie', authCookie)
      .expect(200);
    expect(after.body.updatedAt).toBe(before.body.updatedAt);
  });

  it('cleans up: delete ticket, then epic, then team', async () => {
    await request(server).delete(`/api/tickets/${ticketId}`).set('Cookie', authCookie).expect(204);
    await request(server).delete(`/api/epics/${epicId}`).set('Cookie', authCookie).expect(204);
    await request(server).delete(`/api/teams/${teamId}`).set('Cookie', authCookie).expect(204);
  });
});
