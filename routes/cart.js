const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

router.get('/user/cart', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id).populate('cart');
    const totalAmount = user.cart.reduce((sum, curr) => sum + curr.price, 0);
    const stripePublishableKey = process.env.STRIPE_PUBLIC_KEY; // Use the public key
    res.render('cart/cart', { user, totalAmount, stripePublishableKey });
});

router.post('/user/:productId/add', isLoggedIn, async (req, res) => {
    let { productId } = req.params;
    let userId = req.user._id;
    let product = await Product.findById(productId);
    let user = await User.findById(userId);
    user.cart.push(product);
    await user.save();
    res.redirect('/user/cart');
});

router.post('/user/cart/clear', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.redirect('/user/cart');
});

module.exports = router;