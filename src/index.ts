import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUI from 'swagger-ui-express';

import router from './route/index';
import { connectDatabase } from './common/connectDB';
import { mess500 } from './middleware/constants';
import swaggerDocument from './swagger.json';

dotenv.config();
const app = express();
const port = process.env.PORT;
app.use(express.json({ limit: '15MB' }));
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.get('/', (req, res) => {
  res.send('<h1>Local API</h1><a href="/api-docs">Documentation</a>');
});

app.post('/', (req, res) => {
  // eslint-disable-next-line prefer-destructuring
  // const { title } = req.body;
  console.log(req.body);
  // console.log({ title });
  res.json(true);
});

const pretty = (req, res) => {
  if (!req.response && req.response !== 0 && req.response !== false) {
    res.status(500);
    return res.send(mess500);
  }

  const message = {
    data: {},
    success: true,
    status: 400,
  };
  message.data = req.response;
  message.success = req.response?.errMess ? false : (req.success !== false);
  message.status = req.status || 200;
  return res.status(message.status).send(message);
};

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use('/adapters', router, pretty);

app.listen(port, () => console.log(`Express is listening at http://localhost:${port}`));
connectDatabase();
