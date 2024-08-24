// vcpBackend/src/config/sequelize.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize("vcpLocal", "sa", process.env.DB_PASSWORD, {
  host: "localhost",
  port: 1433,
  dialect: "mssql",
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
});

module.exports = sequelize;

