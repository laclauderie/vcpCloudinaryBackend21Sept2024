// vcpBackend/index.js
const express = require('express');
const path = require('path');
const cors = require('cors');

require('dotenv').config(); // Load environment variables from .env file early
const { connectToDatabase, closeDatabaseConnection } = require('./src/config/db');
const userRoute = require('./src/routes/userRoute');
const businessOwnerRoute = require('./src/routes/businessOwnerRoute');
const paymentRoute = require('./src/routes/paymentRoute');
const commerceRoute = require('./src/routes/commerceRoute');
const categoryRoute = require('./src/routes/categoryRoute');
const productRoutes = require('./src/routes/productsRoute');
const detailsRoute = require('./src/routes/detailsRoute');
const villesRoute = require('./src/routes/villesRoute'); 


const expirePaymentsJob = require('./src/jobs/expirePaymentsJob');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json()); // Parse incoming request bodies
app.use(cors({
  origin: 'http://localhost:8100', // Allow your Ionic app's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies and other credentials
  allowedHeaders: 'Content-Type,Authorization'
}));

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes setup
app.use('/api/users', userRoute);
app.use('/api/business-owners', businessOwnerRoute);
app.use('/api/payments', paymentRoute); 
app.use('/api/my-commerces', commerceRoute); 
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoutes);
app.use('/api/details', detailsRoute);
app.use('/api/villes', villesRoute);

// Function to run expire payments job on startup
const runExpirePaymentsJobOnStart = async () => {
  try {
      await expirePaymentsJob();
      console.log('Expire Payments Job executed successfully on startup.');
  } catch (error) {
      console.error('Error executing expire payments job on startup:', error);
  }
};

// Run the job when the server starts
runExpirePaymentsJobOnStart();

// Start the server after connecting to the database
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error starting server:', error);
    process.exit(1); // Exit the process with error code 1
  });

// Gracefully close the database connection when the process is terminated
process.on('SIGINT', async () => {
  try {
    await closeDatabaseConnection();
    console.log('Database connection closed gracefully');
    process.exit(0); // Exit the process with success code
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1); // Exit the process with error code 1
  }
});

// Gracefully close the database connection on unhandled rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  try {
    await closeDatabaseConnection();
    console.log('Database connection closed gracefully');
    process.exit(1); // Exit the process with error code 1
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1); // Exit the process with error code 1
  }
});
