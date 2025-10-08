const express = require('express');
const auth = require('../middleware/auth');
const Refund = require('../models/Refund');
const Payment = require('../models/Payment');
const { createRefund } = require('../services/stripeService');

const router = express.Router();

// All routes require admin authentication
router.use(auth.verifyToken, auth.isAdmin);

// Get all refunds
router.get('/all', async (req, res) => {
  try {
    const refunds = await Refund.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email')
      .populate('paymentId', 'stripePaymentIntentId serviceDetails amount currency status');

    // Transform to match frontend expected structure
    const transformedRefunds = refunds.map(refund => ({
      _id: refund._id,
      paymentId: refund.paymentId?.stripePaymentIntentId || '',
      userEmail: refund.userId?.email || '',
      serviceId: refund.serviceId,
      serviceTitle: refund.serviceDetails?.title || refund.paymentId?.serviceDetails?.title || 'Service',
      amount: refund.refundAmount,
      currency: refund.currency,
      status: refund.status,
      reason: refund.refundReason,
      notes: refund.statusReason,
      stripeRefundId: refund.stripeRefundId,
      createdAt: refund.createdAt,
      updatedAt: refund.updatedAt,
    }));

    res.json({
      success: true,
      data: transformedRefunds,
    });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch refunds' });
  }
});

// Get specific refund
router.get('/:id', async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('paymentId', 'stripePaymentIntentId serviceDetails amount currency status');

    if (!refund) {
      return res.status(404).json({ success: false, error: 'Refund not found' });
    }

    res.json({ success: true, data: refund });
  } catch (error) {
    console.error('Error fetching refund:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch refund' });
  }
});

// Update refund status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['pending', 'approved', 'rejected', 'processing', 'succeeded', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const refund = await Refund.findById(req.params.id)
      .populate('paymentId', 'stripePaymentIntentId status')
      .populate('userId', 'firstName lastName email');

    if (!refund) {
      return res.status(404).json({ success: false, error: 'Refund not found' });
    }

    // Update refund
    refund.status = status;
    refund.statusReason = notes || '';
    refund.adminApproval.approved = ['approved', 'succeeded'].includes(status) ? true : (status === 'rejected' ? false : null);
    refund.adminApproval.approvedBy = req.user.userId;
    refund.adminApproval.approvedAt = new Date();

    // If approving, process the Stripe refund
    if (status === 'approved' && refund.paymentId) {
      try {
        // Get payment intent ID from the payment
        const paymentIntentId = refund.paymentId.stripePaymentIntentId;
        if (!paymentIntentId) {
          throw new Error('No payment intent ID found');
        }

        // Create Stripe refund
        const stripeRefund = await createRefund(refund, paymentIntentId);

        // Update refund with Stripe ID
        refund.stripeRefundId = stripeRefund.id;
        refund.status = 'processing'; // Will be updated by webhook later

        console.log(`Stripe refund created: ${stripeRefund.id}`);
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        return res.status(500).json({
          success: false,
          error: 'Failed to process Stripe refund',
          details: stripeError.message
        });
      }
    }

    // If marking as succeeded or failed
    if (status === 'succeeded' || status === 'failed') {
      refund.refundProcessedAt = new Date();
    }

    // Update payment status if refund succeeded
    if (status === 'succeeded' && refund.paymentId) {
      const payment = await Payment.findById(refund.paymentId);
      if (payment) {
        payment.status = 'refunded';
        await payment.save();
      }
    }

    await refund.save();

    const message = status === 'approved'
      ? 'Refund approved and processed'
      : status === 'rejected'
        ? 'Refund request rejected'
        : status === 'succeeded'
          ? 'Refund successfully completed'
          : 'Refund status updated';

    res.json({
      success: true,
      data: refund,
      message: message
    });
  } catch (error) {
    console.error('Error updating refund status:', error);
    res.status(500).json({ success: false, error: 'Failed to update refund status' });
  }
});

// Get refunds by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;

    if (!['pending', 'approved', 'rejected', 'processing', 'succeeded', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const refunds = await Refund.find({ status })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email')
      .populate('paymentId', 'stripePaymentIntentId serviceDetails amount currency status');

    res.json({ success: true, data: refunds });
  } catch (error) {
    console.error('Error fetching refunds by status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch refunds by status' });
  }
});

module.exports = router;
