// vcpBackend/src/config/config.js
require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  development: {
    username: "sa",
    password: process.env.DB_PASSWORD,
    database: "vcpLocal",
    host: "127.0.0.1",
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    }
  },
  test: {
    username: "sa",
    password: process.env.DB_PASSWORD,
    database: "vcpLocal_test",
    host: "127.0.0.1",
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    }
  },
  production: {
    username: "sa",
    password: process.env.DB_PASSWORD,
    database: "vcpLocal_prod",
    host: "127.0.0.1",
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    }
  }
};
