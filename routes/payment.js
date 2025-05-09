const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', isLoggedIn, async (req, res) => {
    const { amount, productName } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: { name: productName },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${req.headers.origin}/success`,
            cancel_url: `${req.headers.origin}/cancel`,
            metadata: {
                txnId: uuidv4(),
                user: req.user ? req.user._id.toString() : 'guest'
            }
        });
        res.json({ id: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/success', isLoggedIn, (req, res) => {
    res.render('payment/success');
});
router.get('/cancel', isLoggedIn, (req, res) => {
    res.render('payment/cancel');
});

module.exports = router;