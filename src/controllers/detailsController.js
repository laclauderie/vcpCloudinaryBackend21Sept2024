// vcpBackend/src/controllers/detailsController.js
const Detail = require('../models/detailsModel');
const Product = require('../models/productsModel');
const Category = require('../models/categoriesModel');
const Commerce = require('../models/commercesModel');
const BusinessOwner = require('../models/businessOwnersModel');

// Create a new detail
async function createDetail(req, res) {
    try {
        const { commerceId, categoryId, productId } = req.params; // Get commerceId, categoryId, and productId from route parameters
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT

        const { detail_name, description } = req.body; // Get detail information from the request body
        const image_detail = req.file ? req.file.buffer : null; // Get image if provided

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Verify commerce ownership
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Verify category ownership within the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
        }

        // Verify product ownership within the category
        const product = await Product.findOne({ where: { id: productId, category_id: category.id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the category' });
        }

        // Create the detail
        const newDetail = await Detail.create({
            detail_name,
            description,
            product_id: product.id,
            image_detail
        });

        res.status(201).json(newDetail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get all details for a specific product
async function getDetailsByProduct(req, res) {
    try {
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT
        const { commerceId, categoryId, productId } = req.params; // Get commerceId, categoryId, and productId from route parameters

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Verify commerce ownership
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Verify category ownership within the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
        }

        // Verify product ownership within the category
        const product = await Product.findOne({ where: { id: productId, category_id: category.id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the category' });
        }

        // Fetch all details related to the product
        const details = await Detail.findAll({ where: { product_id: product.id } });

        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get a detail by its ID
async function getDetailById(req, res) {
    try {
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT
        const { commerceId, categoryId, productId, detailId } = req.params; // Get commerceId, categoryId, productId, and detailId from route parameters

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Verify commerce ownership
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Verify category ownership within the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
        }

        // Verify product ownership within the category
        const product = await Product.findOne({ where: { id: productId, category_id: category.id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the category' });
        }

        // Fetch the detail by its ID and verify its association with the product
        const detail = await Detail.findOne({
            where: { id: detailId, product_id: product.id }
        });
        if (!detail) {
            return res.status(404).json({ error: 'Detail not found or does not belong to the product' });
        }

        res.status(200).json(detail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Update a detail
async function updateDetail(req, res) {
    try {
        const { detail_name, description } = req.body; // Get non-image detail fields from the request body
        const image_detail = req.file ? req.file.buffer : null; // Get the image file buffer if present
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT
        const { commerceId, categoryId, productId, detailId } = req.params; // Get commerceId, categoryId, productId, and detailId from route parameters

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Verify commerce ownership
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Verify category ownership within the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
        }

        // Verify product ownership within the category
        const product = await Product.findOne({ where: { id: productId, category_id: category.id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the category' });
        }

        // Fetch the detail by its ID and verify its association with the product
        const detail = await Detail.findOne({
            where: { id: detailId, product_id: product.id }
        });
        if (!detail) {
            return res.status(404).json({ error: 'Detail not found or does not belong to the product' });
        }

        // Update detail fields
        detail.detail_name = detail_name || detail.detail_name;
        detail.description = description || detail.description;
        if (image_detail) {
            detail.image_detail = image_detail;
        }

        await detail.save();
        res.status(200).json(detail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Delete a detail
async function deleteDetail(req, res) {
    try {
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT
        const { commerceId, categoryId, productId, detailId } = req.params; // Get commerceId, categoryId, productId, and detailId from route parameters

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Verify commerce ownership
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Verify category ownership within the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the commerce' });
        }

        // Verify product ownership within the category
        const product = await Product.findOne({ where: { id: productId, category_id: category.id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the category' });
        }

        // Fetch the detail by its ID and verify its association with the product
        const detail = await Detail.findOne({
            where: { id: detailId, product_id: product.id }
        });
        if (!detail) {
            return res.status(404).json({ error: 'Detail not found or does not belong to the product' });
        }

        await detail.destroy();
        res.status(204).send(); // No Content
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Method to get details by product ID for non-logged-in users
async function getDetailsByProductIdForNonLoggedUser(req, res) {
    try {
        const { productId } = req.params; // Get productId from route parameters

        // Retrieve the product
        const product = await Product.findOne({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Retrieve all details related to the product
        const details = await Detail.findAll({ where: { product_id: productId } });

        if (!details.length) {
            return res.status(404).json({ error: 'No details found for this product' });
        }

        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createDetail,
    getDetailsByProduct,
    getDetailById,
    updateDetail,
    deleteDetail,
    getDetailsByProductIdForNonLoggedUser,
};
