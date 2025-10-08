const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');

// Create Stripe checkout session
const createCheckoutSession = async (sessionData) => {
  try {
    const {
      amount,
      currency,
      serviceDetails,
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
      metadata,
    } = sessionData;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: serviceDetails.title,
              description: `Category: ${serviceDetails.category} | Consultant: ${serviceDetails.consultant} | Duration: ${serviceDetails.duration}`,
              metadata: {
                serviceId: serviceDetails.serviceId,
              },
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        amount: amount.toString(),
        currency,
      },
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return session;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    console.error('Stripe error details:', error.message);
    throw new Error(`Stripe checkout session creation failed: ${error.message}`);
  }
};

// Confirm payment intent (webhook handler)
const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed',
      paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
      amountReceived: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw new Error(`Payment intent confirmation failed: ${error.message}`);
  }
};

// Create refund via Stripe
const createRefund = async (refund, paymentIntentId) => {
  try {
    const stripeRefund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refund.refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        userId: refund.userId.toString(),
        serviceId: refund.serviceId.toString(),
        refundReason: refund.refundReason,
      },
    });

    return stripeRefund;
  } catch (error) {
    console.error('Error creating Stripe refund:', error);
    console.error('Stripe refund error details:', error.message);
    throw new Error(`Stripe refund creation failed: ${error.message}`);
  }
};

// Get payment details from Stripe
const getPaymentDetails = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      amountReceived: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentMethod: paymentIntent.payment_method_types?.[0] || 'unknown',
      created: paymentIntent.created,
      description: paymentIntent.description,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    console.error('Error getting payment details:', error);
    throw new Error(`Failed to retrieve payment details: ${error.message}`);
  }
};

// Get refund details from Stripe
const getRefundDetails = async (refundId) => {
  try {
    const refund = await stripe.refunds.retrieve(refundId);

    return {
      id: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      paymentIntent: refund.payment_intent,
      created: refund.created,
      metadata: refund.metadata,
    };
  } catch (error) {
    console.error('Error getting refund details:', error);
    throw new Error(`Failed to retrieve refund details: ${error.message}`);
  }
};

// Update refund status based on Stripe webhook
const updateRefundStatus = async (refundId, status) => {
  try {
    // This function would be called from webhooks
    // For now, we'll just log the status update
    console.log(`Refund ${refundId} status updated to: ${status}`);

    return {
      success: true,
      message: `Refund status updated to ${status}`,
    };
  } catch (error) {
    console.error('Error updating refund status:', error);
    throw new Error(`Refund status update failed: ${error.message}`);
  }
};

// Create Stripe customer (optional for future use)
const createCustomer = async (customerData) => {
  try {
    const { email, name, phone } = customerData;

    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        source: 'canadian-nexus',
      },
    });

    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error(`Customer creation failed: ${error.message}`);
  }
};

// Validate webhook signature
const validateWebhook = (req) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;

  // If no endpoint secret configured, skip validation for development
  if (!endpointSecret) {
    console.warn('STRIPE_WEBHOOK_ENDPOINT_SECRET not configured. Skipping webhook signature validation.');
    return true;
  }

  try {
    const sig = req.get('stripe-signature');
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    return event;
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
};

module.exports = {
  createCheckoutSession,
  confirmPaymentIntent,
  createRefund,
  getPaymentDetails,
  getRefundDetails,
  updateRefundStatus,
  createCustomer,
  validateWebhook,
};
