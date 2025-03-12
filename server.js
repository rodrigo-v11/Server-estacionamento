import express from 'express';
import cors from 'cors';
import publicRoutes from './routes/public.js';
import privateRoutes from './routes/private.js';
import auth from './middlewares/auth.js';



const app = express();
app.use(express.json());
app.use(cors());

app.use('/', publicRoutes); // Rotas públicas, não precisam de autenticação
app.use('/private', auth, privateRoutes); // Rotas privadas, que precisam de autenticação

app.listen(5000, () => console.log('Server is running on port 5000'));