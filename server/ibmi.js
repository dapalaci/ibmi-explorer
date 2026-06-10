require('dotenv').config();
const jt400 = require('node-jt400');

let pool = null;

let config = {
  host: process.env.IBMi_HOST || 'pub400.com',
  user: process.env.IBMi_USER || '',
  password: process.env.IBMi_PASSWORD || '',
  library: process.env.IBMi_LIBRARY || 'DAPALACI',
};

function setConfig(newConfig) {
  config = { ...config, ...newConfig };
  if (pool) {
    try { pool.close && pool.close(); } catch (_) {}
    pool = null;
  }
}

function getConfig() {
  return { host: config.host, user: config.user, library: config.library };
}

function getPool() {
  if (!pool) {
    if (!config.user || !config.password) {
      throw new Error('Credenciales IBM i no configuradas. Verifica el archivo .env o usa el formulario de conexión.');
    }
    pool = jt400.pool({
      host: config.host,
      user: config.user,
      password: config.password,
      naming: 'sql',
    });
  }
  return pool;
}

async function query(sql, params = []) {
  return getPool().query(sql, params);
}

async function execute(sql, params = []) {
  return getPool().execute(sql, params);
}

async function testConnection() {
  const rows = await getPool().query('SELECT 1 AS TEST FROM SYSIBM.SYSDUMMY1');
  return rows.length > 0;
}

module.exports = { query, execute, testConnection, setConfig, getConfig };
