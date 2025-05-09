const express = require('express');
const router = express.Router();
const { validateProduct, isLoggedIn, isSeller, isProductAuthor } = require('../middleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const {
    showAllProducts,
    productForm,
    createProduct,
    showProduct,
    editProductForm,
    updateProduct,
    deleteProduct
} = require('../controller/product');

// to show all products
router.get('/products', isLoggedIn, showAllProducts);

// to add a new product 
router.get('/products/new', isLoggedIn, productForm);

// to actually create a new product
router.post('/products', validateProduct, isLoggedIn, isSeller, createProduct);

// to show a single product 
router.get('/products/:id', isLoggedIn, showProduct);

// to edit a product
router.get('/products/:id/edit', isLoggedIn, isProductAuthor, editProductForm);

// to update a product
router.patch('/products/:id', validateProduct, isLoggedIn, updateProduct);

// to delete a product
router.delete('/products/:id', isLoggedIn, isProductAuthor, deleteProduct);

// to checkout a product
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { products } = req.body;

    // Parse the products from the form data
    const parsedProducts = products.map(product => JSON.parse(product));

    const line_items = parsedProducts.map(product => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
        },
        unit_amount: product.price * 100, // assuming the price is in INR
      },
      quantity: product.quantity || 1, // default to 1 if quantity is not provided
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "http://localhost:5000/products",
      cancel_url: "http://localhost:5000/products",
    });

    res.redirect(303, session.url);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

module.exports = router;