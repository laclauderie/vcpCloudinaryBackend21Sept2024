// vcpBackend/src/config/db.js
const sequelize = require('./sequelize');
const User = require('../models/userModel');
const BusinessOwner = require('../models/businessOwnersModel');
const Payments = require('../models/paymentsModel'); 
const BusinessOwnersPayments = require('../models/businessOwnersPaymentsModel'); 
const AccessControl = require('../models/accessControlModel');
const Commerces = require('../models/commercesModel');
const Villes = require('../models/villesModel');
const Categories = require('../models/categoriesModel');
const Products = require('../models/productsModel');
const Details = require('../models/detailsModel');

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log(
      'Connection to the database has been established successfully.'
    );
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

async function closeDatabaseConnection() {
  await sequelize.close();
  console.log('Database connection closed.');
}

async function initDatabase() {
  try {
    await connectToDatabase();
    setupAssociations();
    await sequelize.sync();
    console.log('Database initialized successfully');
  } catch (err) {
    console.log('Errors during database initialization:', err);
    throw err;
  }
}

function setupAssociations() {
  // User and BusinessOwner
  User.hasOne(BusinessOwner, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  BusinessOwner.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

  // BusinessOwner and Payments
  BusinessOwner.hasMany(Payments, {
    foreignKey: 'business_owner_id',
    onDelete: 'CASCADE',
  });
  Payments.belongsTo(BusinessOwner, {
    foreignKey: 'business_owner_id',
    onDelete: 'CASCADE',
  });

  // BusinessOwner and BusinessOwnersPayments
  BusinessOwner.hasOne(BusinessOwnersPayments, {
    foreignKey: 'business_owner_id',
    onDelete: 'CASCADE',
  });
  BusinessOwnersPayments.belongsTo(BusinessOwner, {
    foreignKey: 'business_owner_id',
    onDelete: 'CASCADE',
  });

  // Payment and BusinessOwnersPayments
  Payments.hasOne(BusinessOwnersPayments, {
    foreignKey: 'payment_id',
    onDelete: 'CASCADE',
  });
  BusinessOwnersPayments.belongsTo(Payments, {
    foreignKey: 'payment_id',
    onDelete: 'CASCADE',
  });

  // BusinessOwner and AccessControl
  BusinessOwner.hasOne(AccessControl, {
    foreignKey: 'business_owner_id',
    onDelete: 'CASCADE',
  });
  AccessControl.belongsTo(BusinessOwner, {
    foreignKey: 'business_owner_id',
    onDelete: 'CASCADE',
  });

  // BusinessOwner and Commerces
  BusinessOwner.hasMany(Commerces, {
    foreignKey: 'business_owner_id',
    onDelete: 'CASCADE',
  });
  Commerces.belongsTo(BusinessOwner, {
    foreignKey: 'business_owner_id',
    onDelete: 'CASCADE',
  });

  // Commerces and Villes
  Commerces.belongsTo(Villes, {
    foreignKey: 'ville_id',
    onDelete: 'CASCADE',
  });
  Villes.hasMany(Commerces, {
    foreignKey: 'ville_id',
    onDelete: 'CASCADE',
  });

  // Categories and Commerces
  Categories.belongsTo(Commerces, {
    foreignKey: 'commerce_id',
    onDelete: 'CASCADE',
  });
  Commerces.hasMany(Categories, {
    foreignKey: 'commerce_id',
    onDelete: 'CASCADE',
  });

  // Products and Categories
  Products.belongsTo(Categories, {
    foreignKey: 'category_id',
    onDelete: 'CASCADE',
  });
  Categories.hasMany(Products, {
    foreignKey: 'category_id',
    onDelete: 'CASCADE',
  });

  // Details and Products
  Details.belongsTo(Products, {
    foreignKey: 'product_id',
    onDelete: 'CASCADE',
  });
  Products.hasMany(Details, {
    foreignKey: 'product_id',
    onDelete: 'CASCADE',
  });
}

// Initialize the database
initDatabase().catch((error) => {
  console.error('Error initializing database:', error);
  process.exit(1); 
});

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  setupAssociations,
};
