const { Project, Milestone, Task, Client, Company, User, Requirement } = require('../models');

async function generateProjectCode() {
  const count = await Project.count();
  return `PRJ-${1000 + count + 1}`;
}

async function createProject({ name, clientId, pmId, startDate, endDate, budget, description }) {
  const code = await generateProjectCode();
  return Project.create({ code, name, clientId, pmId, startDate, endDate, budget, description });
}

async function listProjects(query) {
  const where = {};
  if (query.clientId) where.clientId = query.clientId;
  if (query.pmId) where.pmId = query.pmId;
  if (query.status) where.status = query.status;

  return Project.findAll({
    where,
    include: [
      { model: Client, include: [{ model: Company, attributes: ['id', 'name'] }] },
      { model: User, as: 'projectManager', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}

async function getProjectById(id) {
  return Project.findByPk(id, {
    include: [
      { model: Client, include: [{ model: Company }] },
      { model: User, as: 'projectManager', attributes: ['id', 'name', 'email'] },
      { model: Milestone },
      { model: Task, include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }] },
      { model: Requirement },
    ],
  });
}

async function updateProjectStatus(id, status) {
  const project = await Project.findByPk(id);
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  project.status = status;
  await project.save();
  return project;
}

async function createMilestone(projectId, { title, dueDate }) {
  return Milestone.create({ projectId, title, dueDate });
}

async function createTask({ projectId, milestoneId, assigneeId, title, description, priority, dueDate }) {
  return Task.create({ projectId, milestoneId, assigneeId, title, description, priority, dueDate });
}

async function updateTaskStatus(taskId, status) {
  const task = await Task.findByPk(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  task.status = status;
  await task.save();
  return task;
}

async function getTaskBoard(projectId) {
  const statuses = ['todo', 'in_progress', 'in_review', 'done'];
  const tasks = await Task.findAll({
    where: { projectId },
    include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }],
    order: [['createdAt', 'ASC']],
  });

  const board = Object.fromEntries(statuses.map((s) => [s, []]));
  tasks.forEach((t) => board[t.status]?.push(t));
  return board;
}

async function getMyWork(userId) {
  return Task.findAll({
    where: { assigneeId: userId },
    include: [{ model: Project, attributes: ['id', 'name', 'code'] }],
    order: [['dueDate', 'ASC']],
  });
}

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  updateProjectStatus,
  createMilestone,
  createTask,
  updateTaskStatus,
  getTaskBoard,
  getMyWork,
};
