const clientService = require('../services/client.service');
const { success } = require('../utils/response');

async function listClients(req, res, next) {
  try {
    const clients = await clientService.listClients();
    return success(res, { data: clients });
  } catch (err) {
    next(err);
  }
}

module.exports = { listClients };
