import express from 'express'
import cors from 'cors'
import {errorMiddleware} from './middlewares/error.js'
import dotenv from 'dotenv'
import appointmentRoute from './routes/appointmentRoute.js'
import orderRoute from './routes/orderRoute.js'
import patientRoute from './routes/patientRoute.js'
import providerRoute from './routes/providerRote.js'


  dotenv.config({path: './.env',});

  export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
  const port = process.env.PORT || 4000;


  const app = express();


 app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
  origin: (origin, callback) => callback(null, origin), // reflect the request origin
  credentials: true
}));



  app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

app.use('/api/mock', appointmentRoute);
app.use('/api/mock', orderRoute);
app.use('/api/mock', patientRoute);
app.use('/api/mock', providerRoute);


  app.use(errorMiddleware);


  app.listen(port, () => console.log(`Server is working on Port:${port} in ${envMode} Mode.`));