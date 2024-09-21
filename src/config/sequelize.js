// /Users/jclonana2005hotmail.com/vcpCloudinary/laclauderie-expressIonic24Aout2024Backend/src/config/sequelize.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Create a new Sequelize instance for Azure SQL Database
const sequelize = new Sequelize(
  process.env.DB_NAME,            // Database name from .env
  process.env.DB_USER,            // Username from .env
  process.env.DB_PASSWORD,        // Password from .env
  {
    host: process.env.DB_HOST,    // Host from .env (Azure SQL server)
    port: process.env.DB_PORT,    // Port from .env (usually 1433)
    dialect: "mssql",             // Specify MSSQL dialect
    dialectOptions: {
      options: {
        encrypt: true,            // For Azure SQL encryption
        trustServerCertificate: true, // Use this option for self-signed certificates
      },
    },
    logging: false,               // Disable logging if not needed
  }
);

module.exports = sequelize;
