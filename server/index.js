require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const ibmi = require('./ibmi');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const tablesRouter = require('./routes/tables');
const schemaRouter = require('./routes/schema');
const queryRouter = require('./routes/query');

app.use('/api/tables', tablesRouter);
app.use('/api/tables', schemaRouter);
app.use('/api/query', queryRouter);

app.post('/api/connect', async (req, res) => {
  const { host, user, password, library } = req.body;
  if (!user || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }
  ibmi.setConfig({ host, user, password, library });
  try {
    await ibmi.testConnection();
    res.json({ ok: true, message: 'Conexión establecida exitosamente' });
  } catch (err) {
    res.status(500).json({ error: `No se pudo conectar: ${err.message}` });
  }
});

app.get('/api/config', (req, res) => {
  res.json(ibmi.getConfig());
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`IBM i Explorer server running on http://localhost:${PORT}`);
  console.log(`IBM i Host: ${process.env.IBMi_HOST || 'pub400.com'}`);
  console.log(`IBM i User: ${process.env.IBMi_USER || '(no configurado)'}`);
});
