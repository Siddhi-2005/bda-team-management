const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Team = require('../models/Team');
const Lead = require('../models/Lead');
const Task = require('../models/Task');

const tokenFor = async (email, password = 'password123') =>
  (await request(app).post('/api/auth/login').send({ email, password })).body.token;
const auth = (t) => ({ Authorization: `Bearer ${t}` });

let admin, manager, bdaA, bdaB, teamA, teamB, tAdmin, tMgr, tA, tB, leadA, leadB, taskB;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bda_test');
  await mongoose.connection.dropDatabase();
  admin = await User.create({ name: 'Admin', email: 'admin@t.com', password: 'password123', role: 'admin' });
  manager = await User.create({ name: 'Mgr', email: 'mgr@t.com', password: 'password123', role: 'manager' });
  bdaA = await User.create({ name: 'Alice', email: 'a@t.com', password: 'password123', role: 'bda' });
  bdaB = await User.create({ name: 'Bob', email: 'b@t.com', password: 'password123', role: 'bda' });
  teamA = await Team.create({ name: 'Team A', manager: manager._id, members: [manager._id, bdaA._id] });
  teamB = await Team.create({ name: 'Team B', manager: admin._id, members: [bdaB._id] });
  await User.updateOne({ _id: manager._id }, { team: teamA._id });
  await User.updateOne({ _id: bdaA._id }, { team: teamA._id });
  await User.updateOne({ _id: bdaB._id }, { team: teamB._id });
  leadA = await Lead.create({ name: '=HYPERLINK("evil")', status: 'new', value: 100, assignedTo: bdaA._id, team: teamA._id, followUpDate: new Date(Date.now() - 2 * 86400000) });
  leadB = await Lead.create({ name: 'Bob lead', status: 'new', value: 200, assignedTo: bdaB._id, team: teamB._id, followUpDate: new Date(Date.now() + 86400000) });
  taskB = await Task.create({ title: 'Bob task', assignedTo: bdaB._id, team: teamB._id });
  [tAdmin, tMgr, tA, tB] = await Promise.all(['admin@t.com', 'mgr@t.com', 'a@t.com', 'b@t.com'].map((e) => tokenFor(e)));
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('auth hardening', () => {
  test('public register can never create an admin or manager', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'Evil', email: 'evil@t.com', password: 'longenough1', role: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('bda');
  });
  test('register rejects short passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'X', email: 'x@t.com', password: '123' });
    expect(res.status).toBe(400);
  });
  test('login is immune to NoSQL operator injection', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } });
    expect(res.status).toBe(400);
  });
  test('wrong password -> 401, no token -> 401', async () => {
    expect((await request(app).post('/api/auth/login').send({ email: 'a@t.com', password: 'nope' })).status).toBe(401);
    expect((await request(app).get('/api/leads')).status).toBe(401);
  });
  test('/api/seed no longer exists', async () => {
    expect((await request(app).get('/api/seed')).status).toBe(404);
  });
  test('profile update cannot change role', async () => {
    const res = await request(app).put('/api/auth/profile').set(auth(tA)).send({ name: 'Alice 2', role: 'admin', isActive: false });
    expect(res.body.user.name).toBe('Alice 2');
    expect(res.body.user.role).toBe('bda');
    expect((await User.findById(bdaA._id)).isActive).toBe(true);
  });
  test('deactivated users are locked out immediately', async () => {
    const u = await User.create({ name: 'Tmp', email: 'tmp@t.com', password: 'password123' });
    const t = await tokenFor('tmp@t.com');
    await User.updateOne({ _id: u._id }, { isActive: false });
    expect((await request(app).get('/api/auth/me').set(auth(t))).status).toBe(401);
  });
});

describe('data isolation', () => {
  test('BDA cannot read another BDA\'s lead or task by id', async () => {
    expect((await request(app).get(`/api/leads/${leadB._id}`).set(auth(tA))).status).toBe(404);
    expect((await request(app).get(`/api/tasks/${taskB._id}`).set(auth(tA))).status).toBe(404);
  });
  test('BDA lead list only contains own leads', async () => {
    const res = await request(app).get('/api/leads').set(auth(tA));
    expect(res.body.leads.every((l) => l.assignedTo._id === String(bdaA._id))).toBe(true);
  });
  test('BDA cannot update/delete another BDA\'s lead', async () => {
    expect((await request(app).put(`/api/leads/${leadB._id}`).set(auth(tA)).send({ status: 'won' })).status).toBe(404);
    expect((await request(app).delete(`/api/leads/${leadB._id}`).set(auth(tA))).status).toBe(403);
  });
  test('manager only sees own team\'s leads', async () => {
    const res = await request(app).get('/api/leads').set(auth(tMgr));
    const ids = res.body.leads.map((l) => l._id);
    expect(ids).toContain(String(leadA._id));
    expect(ids).not.toContain(String(leadB._id));
  });
  test('admin sees everything', async () => {
    const res = await request(app).get('/api/leads').set(auth(tAdmin));
    expect(res.body.total).toBeGreaterThanOrEqual(2);
  });
  test('bad object ids return 404, not a 500', async () => {
    expect((await request(app).get('/api/leads/not-an-id').set(auth(tAdmin))).status).toBe(404);
  });
});

describe('mass assignment & privilege checks', () => {
  test('BDA cannot reassign a lead or forge activity history', async () => {
    const res = await request(app).put(`/api/leads/${leadA._id}`).set(auth(tA))
      .send({ assignedTo: String(bdaB._id), team: String(teamB._id), activities: [{ action: 'forged' }], value: 555 });
    expect(res.status).toBe(200);
    const l = await Lead.findById(leadA._id);
    expect(String(l.assignedTo)).toBe(String(bdaA._id));
    expect(l.value).toBe(555);
    expect(l.activities.some((a) => a.action === 'forged')).toBe(false);
  });
  test('BDA cannot use the users API', async () => {
    expect((await request(app).get('/api/users').set(auth(tA))).status).toBe(403);
    expect((await request(app).post('/api/users').set(auth(tA)).send({})).status).toBe(403);
  });
  test('manager cannot create admins, nor see admin accounts', async () => {
    const res = await request(app).post('/api/users').set(auth(tMgr)).send({ name: 'Sneaky', email: 's@t.com', password: 'password123', role: 'admin' });
    expect(res.status).toBe(403);
    const list = await request(app).get('/api/users').set(auth(tMgr));
    expect(list.body.users.some((u) => u.role === 'admin')).toBe(false);
    expect((await request(app).put(`/api/users/${admin._id}`).set(auth(tMgr)).send({ name: 'hacked' })).status).toBe(403);
  });
  test('admin password reset is hashed and works for login', async () => {
    const res = await request(app).put(`/api/users/${bdaB._id}`).set(auth(tAdmin)).send({ password: 'brandnewpass1' });
    expect(res.status).toBe(200);
    expect((await request(app).post('/api/auth/login').send({ email: 'b@t.com', password: 'brandnewpass1' })).status).toBe(200);
  });
  test('admin cannot demote or delete themselves', async () => {
    expect((await request(app).put(`/api/users/${admin._id}`).set(auth(tAdmin)).send({ role: 'bda' })).status).toBe(400);
    expect((await request(app).delete(`/api/users/${admin._id}`).set(auth(tAdmin))).status).toBe(400);
  });
  test('negative deal values are rejected', async () => {
    const res = await request(app).post('/api/leads').set(auth(tA)).send({ name: 'Neg', value: -5 });
    expect(res.status).toBe(400);
  });
});

describe('new features', () => {
  test('search treats regex characters literally (no crash / ReDoS)', async () => {
    const res = await request(app).get('/api/leads').query({ search: '(((' }).set(auth(tAdmin));
    expect(res.status).toBe(200);
  });
  test('follow-ups: overdue and upcoming are bucketed and role-scoped', async () => {
    const res = await request(app).get('/api/leads/follow-ups').set(auth(tA));
    expect(res.body.counts.overdue).toBe(1);
    expect(res.body.overdue[0]._id).toBe(String(leadA._id));
    const b = await request(app).get('/api/leads/follow-ups').set(auth(tMgr));
    expect(b.body.overdue.map((l) => l._id)).not.toContain(String(leadB._id));
  });
  test('overdue filter on list', async () => {
    const res = await request(app).get('/api/leads?overdue=true').set(auth(tAdmin));
    expect(res.body.leads.map((l) => l._id)).toEqual([String(leadA._id)]);
  });
  test('pipeline groups by all 7 stages with totals', async () => {
    const res = await request(app).get('/api/leads/pipeline').set(auth(tAdmin));
    expect(res.body.pipeline).toHaveLength(7);
    const n = res.body.pipeline.find((s) => s.stage === 'new');
    expect(n.count).toBe(2);
  });
  test('CSV export is scoped and neutralises spreadsheet formulas', async () => {
    const res = await request(app).get('/api/leads/export').set(auth(tA));
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain(`"'=HYPERLINK(""evil"")"`);
    expect(res.text).not.toContain('Bob lead');
  });
  test('status change writes an audit entry and sets closedDate', async () => {
    const res = await request(app).put(`/api/leads/${leadA._id}`).set(auth(tA)).send({ status: 'won' });
    expect(res.body.lead.closedDate).toBeTruthy();
    expect(res.body.lead.activities.map((a) => a.action).join('|')).toMatch(/WON/);
  });
  test('public contact form creates an unassigned website lead; bad input rejected', async () => {
    expect((await request(app).post('/api/public/contact').send({ name: 'Visitor', email: 'v@x.com', notes: 'hi' })).status).toBe(201);
    const l = await Lead.findOne({ name: 'Visitor' });
    expect(l.source).toBe('website');
    expect(l.assignedTo).toBeUndefined();
    expect((await request(app).post('/api/public/contact').send({ name: { $ne: 1 }, email: 'v@x.com' })).status).toBe(400);
  });
  test('dashboard numbers match role scope', async () => {
    const a = await request(app).get('/api/dashboard/stats').set(auth(tA));
    expect(a.body.stats.totalLeads).toBe(1);
    const m = await request(app).get('/api/dashboard/stats').set(auth(tMgr));
    expect(m.status).toBe(200);
  });
});
