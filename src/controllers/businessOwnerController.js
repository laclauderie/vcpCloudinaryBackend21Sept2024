// vcpBackend/src/controllers/businessOwnerController.js
const fs = require('fs');
const path = require('path');

const BusinessOwner = require("../models/businessOwnersModel");
const User = require("../models/userModel");

// Constants for error messages
const USER_NOT_FOUND = "User not found";
const BUSINESS_OWNER_NOT_FOUND = "Business owner not found";

// Get the business owner by ID for non-logged-in users
const getBusinessOwnerById = async (req, res) => {
  const { id } = req.params; // Extract the ID from request parameters

  try {
    // Find the business owner by ID
    const businessOwner = await BusinessOwner.findByPk(id);

    // Check if the business owner was found
    if (businessOwner) {
      res.status(200).json(businessOwner);
    } else {
      res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error fetching business owner:", error); // Improved logging
    res.status(500).json({ error: error.message });
  }
};

// Get the business owner data for the logged-in user
const getBusinessOwnerForUser = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: req.user.userId },
    });
    if (businessOwner) {
      res.status(200).json(businessOwner);
    } else {
      res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error fetching business owner:", error); // Improved logging
    res.status(500).json({ error: error.message });
  }
};

// Create a new business owner for the logged-in user
const createBusinessOwnerForUser = async (req, res) => {
  const { name, image_owner, adresse, telephone1, telephone2, role } = req.body;
  try {
    const user = await User.findByPk(req.user.userId); // Fetch the user details
    if (!user) {
      return res.status(404).json({ error: USER_NOT_FOUND });
    }

    const businessOwner = await BusinessOwner.create({
      name,
      image_owner,
      adresse,
      telephone1,
      telephone2,
      monthly_fee_paid: false, // Set monthly_fee_paid to false
      role,
      email: user.email, // Use the user's email fetched from the database
      user_id: user.id, // Use the user's ID fetched from the database
    });
    res.status(201).json(businessOwner);
  } catch (error) {
    console.error("Error creating business owner:", error); // Improved logging
    res.status(400).json({ error: error.message });
  }
};

// Update the non-image fields of the business owner for the logged-in user
const updateBusinessOwnerNonImageFields = async (req, res) => {
  const { name, adresse, telephone1, telephone2, monthly_fee_paid, role } = req.body;
  try {
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: req.user.userId },
    });
    if (businessOwner) {
      // Only update fields that are present in the request body
      if (name !== undefined) businessOwner.name = name;
      if (adresse !== undefined) businessOwner.adresse = adresse;
      if (telephone1 !== undefined) businessOwner.telephone1 = telephone1;
      if (telephone2 !== undefined) businessOwner.telephone2 = telephone2;
      if (monthly_fee_paid !== undefined) businessOwner.monthly_fee_paid = monthly_fee_paid;
      if (role !== undefined) businessOwner.role = role;

      await businessOwner.save();
      res.status(200).json(businessOwner);
    } else {
      res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error updating business owner non-image fields:", error);
    res.status(400).json({ error: error.message });
  }
};

// Update the business owner's image
const updateBusinessOwnerImage = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: req.user.userId },
    });

    if (businessOwner) {
      if (req.file) {
        businessOwner.image_owner = req.file.buffer; // Save the image data (buffer) directly to the database
        await businessOwner.save();
        res.status(200).json({
          ...businessOwner.toJSON(), // Convert Sequelize model instance to JSON
          image_uploaded: true // Add a flag to indicate the image was uploaded
        });
      } else {
        res.status(400).json({ error: 'No image file provided' });
      }
    } else {
      res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }
  } catch (error) {
    console.error('Error updating business owner image:', error);
    res.status(400).json({ error: error.message });
  }
};

// Retrieve the business owner's image
const getBusinessOwnerImage = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: req.user.userId },
    });

    if (businessOwner && businessOwner.image_owner) {
      res.writeHead(200, {
        'Content-Type': 'image/jpeg', // Adjust based on the image type (e.g., image/png)
        'Content-Length': businessOwner.image_owner.length
      });
      res.end(businessOwner.image_owner); // Send the image data as a response
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Error retrieving business owner image:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete the business owner data for the logged-in user
const deleteBusinessOwnerForUser = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      where: { user_id: req.user.userId },
    });
    if (businessOwner) {
      await businessOwner.destroy();
      res.status(200).json({ message: "Business owner deleted successfully" });
    } else {
      res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error deleting business owner:", error); // Improved logging
    res.status(500).json({ error: error.message });
  }
};

// Find business owner by email
const findBusinessOwnerByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const businessOwner = await BusinessOwner.findOne({ where: { email } });
    if (businessOwner) {
      res.status(200).json(businessOwner);
    } else {
      res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }
  } catch (error) {
    console.error("Error finding business owner by email:", error); // Improved logging
    res.status(500).json({ error: error.message });
  }
};

// Update business owner
const updateBusinessOwner = async (req, res) => {
  const { id } = req.params;
  const { name, adresse, telephone1, telephone2, role, image_owner } = req.body;

  try {
    const businessOwner = await BusinessOwner.findByPk(id);

    if (!businessOwner) {
      return res.status(404).json({ error: BUSINESS_OWNER_NOT_FOUND });
    }

    // Update business owner fields
    businessOwner.name = name || businessOwner.name;
    businessOwner.adresse = adresse || businessOwner.adresse;
    businessOwner.telephone1 = telephone1 || businessOwner.telephone1;
    businessOwner.telephone2 = telephone2 || businessOwner.telephone2;
    businessOwner.role = role || businessOwner.role;

    if (req.file) {
      businessOwner.image_owner = req.file.buffer; // Assuming image is uploaded via multer
    }

    await businessOwner.save();

    res.status(200).json(businessOwner);
  } catch (error) {
    console.error('Error updating business owner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  updateBusinessOwner,
  getBusinessOwnerForUser,
  createBusinessOwnerForUser,
  updateBusinessOwnerNonImageFields,
  getBusinessOwnerImage,
  updateBusinessOwnerImage,
  deleteBusinessOwnerForUser,
  findBusinessOwnerByEmail,
  getBusinessOwnerById
};
