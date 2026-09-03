const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { ensureDatabase } = require('./modules/persistence');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

ensureDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor disponível em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Não foi possível inicializar o banco de dados:', error);
    process.exit(1);
  });
