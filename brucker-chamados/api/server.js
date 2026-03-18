require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const clienteRoutes = require('./routes/clientes');
const impressoraRoutes = require('./routes/impressoras');
const chamadoRoutes = require('./routes/chamados');
const tecnicoRoutes = require('./routes/tecnicos');
const relatorioRoutes = require('./routes/relatorios');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware global
app.use(helmet());
app.use(cors({
  origin: true,  // aceita qualquer origem em dev
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/impressoras', impressoraRoutes);
app.use('/api/chamados', chamadoRoutes);
app.use('/api/tecnicos', tecnicoRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API rodando em 0.0.0.0:${PORT}`);
});
