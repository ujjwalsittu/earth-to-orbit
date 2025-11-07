import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env";
import Payment, {
  IPayment,
  PaymentMethod,
  PaymentStatus,
} from "../models/Payment";
import { generatePaymentId } from "../utils/generate-number";
import logger from "../utils/logger";

// Lazy initialize Razorpay client only if API keys are provided
let razorpay: Razorpay | null = null;

const getRazorpayClient = (): Razorpay => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not configured. Please set them in your environment variables to enable Razorpay payments.");
  }

  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpay;
};

/**
 * Create Razorpay order
 */
export const createRazorpayOrder = async (
  invoiceId: string,
  requestId: string,
  organizationId: string,
  amount: number,
  currency = "INR"
): Promise<{ orderId: string; payment: IPayment }> => {
  try {
    // Create Razorpay order
    const client = getRazorpayClient();
    const order = await client.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        invoiceId,
        requestId,
        organizationId,
      },
    });

    // Get the next payment sequence number
    const lastPayment = await Payment.findOne().sort({ createdAt: -1 });
    const sequenceNumber = lastPayment
      ? parseInt(lastPayment.paymentId.split("-")[2]) + 1
      : 1;

    // Create payment record
    const payment = await Payment.create({
      paymentId: generatePaymentId(sequenceNumber),
      invoice: invoiceId,
      request: requestId,
      organization: organizationId,
      amount,
      currency,
      method: PaymentMethod.RAZORPAY,
      status: PaymentStatus.PENDING,
      razorpayOrderId: order.id,
    });

    logger.info(`Razorpay order ${order.id} created for invoice ${invoiceId}`);

    return { orderId: order.id, payment };
  } catch (error: any) {
    logger.error("Failed to create Razorpay order:", error);
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
};

/**
 * Verify Razorpay payment
 */
export const verifyRazorpayPayment = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<IPayment> => {
  try {
    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      throw new Error("Invalid payment signature");
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      throw new Error("Payment record not found");
    }

    // Update payment record
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = PaymentStatus.COMPLETED;
    await payment.save();

    logger.info(`Payment ${payment.paymentId} verified successfully`);

    return payment;
  } catch (error: any) {
    logger.error("Failed to verify Razorpay payment:", error);
    throw new Error(`Failed to verify payment: ${error.message}`);
  }
};

/**
 * Create bank transfer payment
 */
export const createBankTransferPayment = async (
  invoiceId: string,
  requestId: string,
  organizationId: string,
  amount: number,
  transactionId?: string,
  bankName?: string,
  accountNumber?: string,
  proof?: string
): Promise<IPayment> => {
  try {
    // Get the next payment sequence number
    const lastPayment = await Payment.findOne().sort({ createdAt: -1 });
    const sequenceNumber = lastPayment
      ? parseInt(lastPayment.paymentId.split("-")[2]) + 1
      : 1;

    // Create payment record
    const payment = await Payment.create({
      paymentId: generatePaymentId(sequenceNumber),
      invoice: invoiceId,
      request: requestId,
      organization: organizationId,
      amount,
      currency: "INR",
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.PENDING,
      bankTransferDetails: {
        transactionId,
        bankName,
        accountNumber,
        proof,
      },
    });

    logger.info(
      `Bank transfer payment ${payment.paymentId} created for invoice ${invoiceId}`
    );

    return payment;
  } catch (error: any) {
    logger.error("Failed to create bank transfer payment:", error);
    throw new Error(`Failed to create bank transfer payment: ${error.message}`);
  }
};

/**
 * Verify bank transfer payment (admin action)
 */
export const verifyBankTransferPayment = async (
  paymentId: string,
  verifiedBy: string
): Promise<IPayment> => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.method !== PaymentMethod.BANK_TRANSFER) {
      throw new Error("Payment is not a bank transfer");
    }

    payment.status = PaymentStatus.COMPLETED;
    if (payment.bankTransferDetails) {
      payment.bankTransferDetails.verifiedBy = verifiedBy as any;
      payment.bankTransferDetails.verifiedAt = new Date();
    }
    await payment.save();

    logger.info(`Bank transfer payment ${payment.paymentId} verified`);

    return payment;
  } catch (error: any) {
    logger.error("Failed to verify bank transfer:", error);
    throw new Error(`Failed to verify bank transfer: ${error.message}`);
  }
};

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createBankTransferPayment,
  verifyBankTransferPayment,
};
