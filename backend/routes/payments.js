const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Payment = require('../models/Payment');
const Service = require('../models/Service');
const { createCheckoutSession, createRefund } = require('../services/stripeService');
const { verifyToken } = require('../middleware/auth');

// Get user's payment history
router.get('/my-payments', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email');

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message,
    });
  }
});

// Get payment by ID
router.get('/:paymentId', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: req.params.paymentId,
      userId: req.user.userId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message,
    });
  }
});

// Create checkout session for service purchase
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const { serviceId, successUrl, cancelUrl } = req.body;

    // Validate required fields
    if (!serviceId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: 'Service ID, success URL, and cancel URL are required',
      });
    }

    // Get service details
    const service = await Service.findOne({ serviceId });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Convert price to cents (assuming format like "$999")
    const priceInDollars = parseFloat(service.price.replace(/[$,]/g, ''));
    if (isNaN(priceInDollars)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service price format',
      });
    }

    const amountInCents = Math.round(priceInDollars * 100);

    // Create checkout session
    const sessionData = {
      amount: amountInCents,
      currency: 'usd',
      serviceDetails: {
        serviceId: service.serviceId,
        title: service.title,
        category: service.category,
        consultant: service.consultant,
        duration: service.duration,
        price: service.price,
      },
      customerEmail: req.user.email,
      customerName: `${req.user.firstName} ${req.user.lastName}`,
      successUrl,
      cancelUrl,
      metadata: {
        userId: req.user.userId,
        serviceId: service.serviceId,
      },
    };

    const session = await createCheckoutSession(sessionData);

    // Create payment record
    const payment = new Payment({
      userId: req.user.userId,
      serviceId: service.serviceId,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: session.payment_intent || '',
      amount: amountInCents,
      currency: 'usd',
      paymentMethod: 'card',
      serviceDetails: sessionData.serviceDetails,
      customerEmail: req.user.email,
      customerName: sessionData.customerName,
      metadata: sessionData.metadata,
    });

    await payment.save();

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message,
    });
  }
});

module.exports = router;
