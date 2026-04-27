require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User    = require('./src/models/User');
const Team    = require('./src/models/Team');
const Project = require('./src/models/Project');
const Board   = require('./src/models/Board');
const List    = require('./src/models/List');
const Task    = require('./src/models/Task');

const data = require('./fake-data.json');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // ── Clean old seed data ──────────────────────────────────────────────────
  const seedEmails = data.users.map(u => u.email);
  await User.deleteMany({ email: { $in: seedEmails } });
  await Team.deleteMany({ name: data.team.name });
  console.log('🗑️  Old seed data cleared');

  // ── 1. Users ─────────────────────────────────────────────────────────────
  const hashedUsers = [];
  for (const u of data.users) {
    const hashed = await bcrypt.hash(u.password, 12);
    hashedUsers.push({ ...u, password: hashed, isVerified: true });
  }
  const createdUsers = await User.insertMany(hashedUsers, { lean: true });
  const byEmail = (email) => createdUsers.find(u => u.email === email);
  console.log(`👤 ${createdUsers.length} users created`);

  // ── 2. Team ───────────────────────────────────────────────────────────────
  const team = await Team.create({
    name: data.team.name,
    description: data.team.description,
    owner: byEmail(data.team.members.find(m => m.role === 'owner').email)._id,
    slug: data.team.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    members: data.team.members.map(m => ({
      user: byEmail(m.email)._id,
      role: m.role,
    })),
  });
  console.log(`👥 Team "${team.name}" created`);

  // ── 3. Projects ───────────────────────────────────────────────────────────
  const createdProjects = [];
  for (const p of data.projects) {
    const project = await Project.create({
      name: p.name,
      description: p.description,
      color: p.color,
      team: team._id,
      owner: byEmail(p.owner)._id,
      members: p.members.map(e => byEmail(e)._id),
      status: p.status,
      visibility: 'team',
      dueDate: new Date(p.dueDate),
    });
    createdProjects.push(project);
  }
  const byProject = (name) => createdProjects.find(p => p.name === name);
  console.log(`📁 ${createdProjects.length} projects created`);

  // ── 4. Boards ─────────────────────────────────────────────────────────────
  const createdBoards = [];
  for (const b of data.boards) {
    const board = await Board.create({
      name: b.name,
      project: byProject(b.project)._id,
      createdBy: byEmail(b.createdBy)._id,
      background: b.background,
    });
    createdBoards.push(board);
  }
  const byBoard = (name) => createdBoards.find(b => b.name === name);
  console.log(`📋 ${createdBoards.length} boards created`);

  // ── 5. Lists ──────────────────────────────────────────────────────────────
  const createdLists = [];
  for (const l of data.lists) {
    const list = await List.create({
      name: l.name,
      board: byBoard(l.board)._id,
      position: l.position,
    });
    createdLists.push(list);
  }
  const byList = (boardName, listName) =>
    createdLists.find(l => l.board.equals(byBoard(boardName)._id) && l.name === listName);
  console.log(`📝 ${createdLists.length} lists created`);

  // ── 6. Tasks ──────────────────────────────────────────────────────────────
  for (const t of data.tasks) {
    const board   = byBoard(t.board);
    const list    = byList(t.board, t.list);
    const project = createdProjects.find(p =>
      p._id.equals(board.project)
    );

    await Task.create({
      title:       t.title,
      description: t.description,
      board:       board._id,
      list:        list._id,
      project:     project._id,
      createdBy:   byEmail(t.createdBy)._id,
      assignees:   (t.assignees || []).map(e => byEmail(e)._id),
      priority:    t.priority,
      status:      t.status,
      dueDate:     new Date(t.dueDate),
      labels:      t.labels || [],
      checklist:   (t.checklist || []),
      position:    0,
    });
  }
  console.log(`✅ ${data.tasks.length} tasks created`);

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────');
  console.log('Password for all users: Password@123');
  createdUsers.forEach(u => console.log(`  ${u.email}`));
  console.log('─────────────────────────────');

  await mongoose.disconnect();
};

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
