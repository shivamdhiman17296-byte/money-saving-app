import express, { Router, Request, Response } from 'express';
import PaymentService from '../services/paymentService';

const router: Router = express.Router();

/**
 * @route   POST /api/v1/upi/initiate-payment
 * @desc    Initiate a UPI payment
 * @access  Private
 */
router.post('/initiate-payment', async (req: Request, res: Response) => {
  try {
    const { amount, recipientUPI, recipientName, description, email, phone } = req.body;
    const userId = (req as any).userId || 'user_123'; // From auth middleware

    // Validation
    if (!amount || !recipientUPI || !recipientName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, recipientUPI, recipientName',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    const payment = await PaymentService.initiatePayment({
      amount,
      recipientUPI,
      recipientName,
      description: description || 'Payment',
      userId,
      email: email || 'user@example.com',
      phone: phone || '9999999999',
    });

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: (error as Error).message,
    });
  }
});

/**
 * @route   POST /api/v1/upi/verify-payment
 * @desc    Verify payment signature
 * @access  Private
 */
router.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details',
      });
    }

    const isValid = PaymentService.verifyPaymentSignature({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Get payment details
    const paymentDetails = await PaymentService.getPaymentDetails(razorpay_payment_id);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: paymentDetails.status,
        amount: paymentDetails.amount,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: (error as Error).message,
    });
  }
});

/**
 * @route   GET /api/v1/upi/payment/:paymentId
 * @desc    Get payment details
 * @access  Private
 */
router.get('/payment/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
    }

    const paymentDetails = await PaymentService.getPaymentDetails(paymentId);

    res.status(200).json({
      success: true,
      data: paymentDetails,
    });
  } catch (error) {
    console.error('Payment fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: (error as Error).message,
    });
  }
});

/**
 * @route   POST /api/v1/upi/refund
 * @desc    Refund a payment
 * @access  Private
 */
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { paymentId, amount } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
    }

    const refund = await PaymentService.refundPayment(paymentId, amount);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: refund,
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: (error as Error).message,
    });
  }
});

export default router;
