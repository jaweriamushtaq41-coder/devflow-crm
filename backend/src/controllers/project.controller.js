const projectService = require('../services/project.service');
const { recordAudit } = require('../services/audit.service');
const { notifyUser } = require('../services/notification.service');
const { success, created, error } = require('../utils/response');

async function createProject(req, res, next) {
  try {
    const project = await projectService.createProject(req.body);
    await recordAudit({ actorId: req.user.id, action: 'project.create', entityType: 'Project', entityId: project.id });
    if (project.pmId) {
      await notifyUser({ userId: project.pmId, type: 'project_assignment', title: `You were assigned as PM for ${project.name}`, link: `/app/projects/${project.id}` });
    }
    return created(res, { message: 'Project created', data: project });
  } catch (err) {
    next(err);
  }
}

async function listProjects(req, res, next) {
  try {
    const projects = await projectService.listProjects(req.query);
    return success(res, { data: projects });
  } catch (err) {
    next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) return error(res, { message: 'Project not found', status: 404 });
    return success(res, { data: project });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const project = await projectService.updateProjectStatus(req.params.id, req.body.status);
    await recordAudit({
      actorId: req.user.id,
      action: 'project.status_change',
      entityType: 'Project',
      entityId: project.id,
      metadata: { newStatus: req.body.status },
    });
    return success(res, { message: 'Project status updated', data: project });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

async function createMilestone(req, res, next) {
  try {
    const milestone = await projectService.createMilestone(req.params.id, req.body);
    await recordAudit({ actorId: req.user.id, action: 'milestone.create', entityType: 'Milestone', entityId: milestone.id });
    return created(res, { message: 'Milestone created', data: milestone });
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const task = await projectService.createTask({ ...req.body, projectId: req.params.id });
    await recordAudit({ actorId: req.user.id, action: 'task.create', entityType: 'Task', entityId: task.id });
    if (task.assigneeId) {
      await notifyUser({ userId: task.assigneeId, type: 'task_assigned', title: `New task assigned: ${task.title}`, link: `/app/tasks/${task.id}` });
    }
    return created(res, { message: 'Task created', data: task });
  } catch (err) {
    next(err);
  }
}

async function updateTaskStatus(req, res, next) {
  try {
    const task = await projectService.updateTaskStatus(req.params.taskId, req.body.status);
    await recordAudit({
      actorId: req.user.id,
      action: 'task.status_change',
      entityType: 'Task',
      entityId: task.id,
      metadata: { newStatus: req.body.status },
    });
    return success(res, { message: 'Task status updated', data: task });
  } catch (err) {
    if (err.status) return error(res, { message: err.message, status: err.status });
    next(err);
  }
}

async function getTaskBoard(req, res, next) {
  try {
    const board = await projectService.getTaskBoard(req.params.id);
    return success(res, { data: board });
  } catch (err) {
    next(err);
  }
}

async function getMyWork(req, res, next) {
  try {
    const tasks = await projectService.getMyWork(req.user.id);
    return success(res, { data: tasks });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateStatus,
  createMilestone,
  createTask,
  updateTaskStatus,
  getTaskBoard,
  getMyWork,
};
