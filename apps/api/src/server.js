import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: '@inmovia/api',
    time: new Date().toISOString()
  });
});

// (si tenés un router principal, dejalo igual)
// import routes from './routes/index.js';
// app.use('/api', routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Inmovia API] Listening on http://localhost:${PORT}`);
});
