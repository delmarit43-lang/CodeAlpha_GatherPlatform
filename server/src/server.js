/* Gather Platform - HTTP Server Entry Point */

require('dotenv').config();
const app = require('./app');
const { checkDatabaseConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await checkDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Gather Platform Full-Stack Server Running!`);
    console.log(` Server Port: http://localhost:${PORT}`);
    console.log(` Frontend Web: http://localhost:${PORT}/home.html`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

startServer();
