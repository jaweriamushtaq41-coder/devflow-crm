const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const defineUser = require('./user.model');
const defineRole = require('./role.model');
const definePermission = require('./permission.model');
const defineCompany = require('./company.model');
const defineContact = require('./contact.model');
const defineLead = require('./lead.model');
const defineDeal = require('./deal.model');
const defineClient = require('./client.model');
const defineProject = require('./project.model');
const defineMilestone = require('./milestone.model');
const defineTask = require('./task.model');
const defineRequirement = require('./requirement.model');
const defineRequirementVersion = require('./requirementVersion.model');
const defineRequirementApproval = require('./requirementApproval.model');
const defineInvoice = require('./invoice.model');
const defineTicket = require('./ticket.model');
const defineComment = require('./comment.model');
const defineAttachment = require('./attachment.model');
const defineNotification = require('./notification.model');
const defineAuditLog = require('./auditLog.model');

const User = defineUser(sequelize, DataTypes);
const Role = defineRole(sequelize, DataTypes);
const Permission = definePermission(sequelize, DataTypes);
const Company = defineCompany(sequelize, DataTypes);
const Contact = defineContact(sequelize, DataTypes);
const Lead = defineLead(sequelize, DataTypes);
const Deal = defineDeal(sequelize, DataTypes);
const Client = defineClient(sequelize, DataTypes);
const Project = defineProject(sequelize, DataTypes);
const Milestone = defineMilestone(sequelize, DataTypes);
const Task = defineTask(sequelize, DataTypes);
const Requirement = defineRequirement(sequelize, DataTypes);
const RequirementVersion = defineRequirementVersion(sequelize, DataTypes);
const RequirementApproval = defineRequirementApproval(sequelize, DataTypes);
const Invoice = defineInvoice(sequelize, DataTypes);
const Ticket = defineTicket(sequelize, DataTypes);
const Comment = defineComment(sequelize, DataTypes);
const Attachment = defineAttachment(sequelize, DataTypes);
const Notification = defineNotification(sequelize, DataTypes);
const AuditLog = defineAuditLog(sequelize, DataTypes);

/* ---------------------------- Associations ---------------------------- */

// Roles & Permissions (many-to-many via role_permissions)
Role.belongsToMany(Permission, { through: 'role_permissions', timestamps: false });
Permission.belongsToMany(Role, { through: 'role_permissions', timestamps: false });

// User belongsTo Role
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

// Company hasMany Contacts, Leads, Deals
Company.hasMany(Contact, { foreignKey: 'companyId' });
Contact.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Lead, { foreignKey: 'companyId' });
Lead.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Deal, { foreignKey: 'companyId' });
Deal.belongsTo(Company, { foreignKey: 'companyId' });

// Lead relations
Lead.belongsTo(Contact, { foreignKey: 'contactId' });
Lead.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Lead.hasMany(Deal, { foreignKey: 'leadId' });
Deal.belongsTo(Lead, { foreignKey: 'leadId' });
Deal.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

// Client
Company.hasOne(Client, { foreignKey: 'companyId' });
Client.belongsTo(Company, { foreignKey: 'companyId' });
Client.belongsTo(User, { as: 'accountManager', foreignKey: 'accountManagerId' });
Client.belongsTo(User, { as: 'portalUser', foreignKey: 'portalUserId' });
Client.hasMany(Project, { foreignKey: 'clientId' });
Client.hasMany(Invoice, { foreignKey: 'clientId' });
Client.hasMany(Ticket, { foreignKey: 'clientId' });

// Project
Project.belongsTo(Client, { foreignKey: 'clientId' });
Project.belongsTo(User, { as: 'projectManager', foreignKey: 'pmId' });
Project.hasMany(Milestone, { foreignKey: 'projectId' });
Project.hasMany(Task, { foreignKey: 'projectId' });
Project.hasMany(Requirement, { foreignKey: 'projectId' });
Project.hasMany(Invoice, { foreignKey: 'projectId' });
Project.hasMany(Ticket, { foreignKey: 'projectId' });
Invoice.belongsTo(Project, { foreignKey: 'projectId' });
Invoice.belongsTo(Client, { foreignKey: 'clientId' });
Ticket.belongsTo(Project, { foreignKey: 'projectId' });
Ticket.belongsTo(Client, { foreignKey: 'clientId' });

// Milestone / Task
Milestone.belongsTo(Project, { foreignKey: 'projectId' });
Milestone.hasMany(Task, { foreignKey: 'milestoneId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });
Task.belongsTo(Milestone, { foreignKey: 'milestoneId' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });
Task.hasMany(Task, { as: 'subtasks', foreignKey: 'parentTaskId' });

// Requirement Vault
Requirement.belongsTo(Project, { foreignKey: 'projectId' });
Requirement.belongsTo(User, { as: 'submitter', foreignKey: 'submittedBy' });
Requirement.hasMany(RequirementVersion, { foreignKey: 'requirementId', as: 'versions' });
RequirementVersion.belongsTo(Requirement, { foreignKey: 'requirementId' });
RequirementVersion.belongsTo(User, { as: 'createdByUser', foreignKey: 'createdBy' });
RequirementVersion.hasMany(RequirementApproval, { foreignKey: 'versionId', as: 'approvals' });
RequirementApproval.belongsTo(RequirementVersion, { foreignKey: 'versionId' });
RequirementApproval.belongsTo(User, { as: 'approver', foreignKey: 'approverId' });

// Polymorphic-ish comments & attachments (entityType + entityId)
Comment.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
Attachment.belongsTo(User, { as: 'uploader', foreignKey: 'uploadedBy' });

// Notifications & audit logs
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(AuditLog, { as: 'actions', foreignKey: 'actorId' });
AuditLog.belongsTo(User, { as: 'actor', foreignKey: 'actorId' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  Company,
  Contact,
  Lead,
  Deal,
  Client,
  Project,
  Milestone,
  Task,
  Requirement,
  RequirementVersion,
  RequirementApproval,
  Invoice,
  Ticket,
  Comment,
  Attachment,
  Notification,
  AuditLog,
};
