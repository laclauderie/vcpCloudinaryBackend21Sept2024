// vcpBackend/src/controllers/productsController.js
const Product = require('../models/productsModel');
const Category = require('../models/categoriesModel');
const Commerce = require('../models/commercesModel'); // Ensure this import is here
const BusinessOwner = require('../models/businessOwnersModel');

async function createProduct(req, res) {
    try {
        const { product_name, price, reference, description } = req.body;
        const { commerceId, categoryId } = req.params;
        const userId = req.user.userId;

        // Handle file path if file is uploaded
        const image_product = req.file ? req.file.buffer : null; 

        // Retrieve the business owner
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Retrieve the commerce
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Retrieve the category
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the specified commerce' });
        }

        // Create the new product
        const newProduct = await Product.create({
            product_name,
            price,
            reference,
            description,
            category_id: categoryId,
            image_product
        });

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAllProducts(req, res) {
    try {
        const { commerceId, categoryId } = req.params; // Get commerceId and categoryId from route parameters
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Retrieve the commerce using commerceId
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Retrieve the category using categoryId and ensure it belongs to the retrieved commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the specified commerce' });
        }

        // Fetch products related to the specified category
        const products = await Product.findAll({
            where: { category_id: categoryId },
            include: [Category] // Optionally include Category for additional details
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getProductById(req, res) {
    try {
        const { commerceId, categoryId, productId } = req.params; // Get commerceId, categoryId, and productId from route parameters
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Retrieve the commerce using commerceId and ensure it belongs to the business owner
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Retrieve the category using categoryId and ensure it belongs to the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the specified commerce' });
        }

        // Retrieve the product using productId and ensure it belongs to the specified category
        const product = await Product.findOne({
            where: { id: productId, category_id: categoryId },
            include: {
                model: Category,
                include: {
                    model: Commerce,
                    where: { id: commerceId }
                }
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the specified category and commerce' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateProduct(req, res) {
    try {
        const { commerceId, categoryId, productId } = req.params; // Get commerceId, categoryId, and productId from route parameters
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT

        const { product_name, price, reference, description } = req.body; // Get product details from the request body
        const image_product = req.file ? req.file.buffer : null; 

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Retrieve the commerce using commerceId and ensure it belongs to the business owner
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Retrieve the category using categoryId and ensure it belongs to the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the specified commerce' });
        }

        // Retrieve the product using productId and ensure it belongs to the specified category
        const product = await Product.findOne({ where: { id: productId, category_id: categoryId } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the specified category' });
        }

        // Update product details
        product.product_name = product_name || product.product_name;
        product.price = price || product.price;
        product.reference = reference || product.reference;
        product.description = description || product.description;
        product.category_id = categoryId || product.category_id;

        // Update the image if a new file is provided
        if (image_product) {
            product.image_product = image_product; // Update the product image path
        }

        await product.save();
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteProduct(req, res) {
    try {
        const { commerceId, categoryId, productId } = req.params; // Get commerceId, categoryId, and productId from route parameters
        const userId = req.user.userId; // Get the logged-in user's ID from the JWT

        // Retrieve the business owner using the logged-in user's ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ error: 'Business owner not found' });
        }
        if (!businessOwner.monthly_fee_paid) {
            return res.status(403).json({ error: 'Monthly fee not paid' });
        }

        // Retrieve the commerce using commerceId and ensure it belongs to the business owner
        const commerce = await Commerce.findOne({ where: { id: commerceId, business_owner_id: businessOwner.id } });
        if (!commerce) {
            return res.status(404).json({ error: 'Commerce not found or does not belong to the business owner' });
        }

        // Retrieve the category using categoryId and ensure it belongs to the commerce
        const category = await Category.findOne({ where: { id: categoryId, commerce_id: commerce.id } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found or does not belong to the specified commerce' });
        }

        // Retrieve the product using productId and ensure it belongs to the specified category
        const product = await Product.findOne({ where: { id: productId, category_id: categoryId } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found or does not belong to the specified category' });
        }

        // Delete the product
        await product.destroy();
        res.status(204).send(); // No content to return
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getProductsByCategoryIdForNonLoggedUser(req, res) {
    try {
        const { categoryId } = req.params;

        // Check if the category exists
        const category = await Category.findOne({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Retrieve products associated with the given category ID
        const products = await Product.findAll({
            where: { category_id: categoryId },
            attributes: ['id', 'product_name', 'price', 'reference', 'description', 'image_product'],
            include: [{
                model: Category,
                attributes: ['category_name'],
                include: [{
                    model: Commerce,
                    attributes: ['commerce_name']
                }]
            }]
        });

        // If no products are found, return an empty array
        if (!products.length) {
            return res.status(200).json([]);
        }

        // Convert image buffers to base64 strings for easy rendering on the client side
        const productsWithImages = products.map(product => {
            return {
                ...product.get({ plain: true }),
                image_product: product.image_product ? Buffer.from(product.image_product).toString('base64') : null
            };
        });

        res.status(200).json(productsWithImages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategoryIdForNonLoggedUser,
   
};
