const { Client, Company } = require('../models');

async function listClients() {
  return Client.findAll({
    include: [{ model: Company, attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
  });
}

module.exports = { listClients };
