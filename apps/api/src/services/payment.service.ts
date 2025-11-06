import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../models/Payment';
import { Invoice } from '../models/Invoice';
import { PaymentMethod, PaymentStatus } from '@e2o/types';
import { env } from '../config/env';
import { generateSequentialNumber } from '../utils/generate-number';
import { BadRequestError, NotFoundError } from '../utils/api-error';
import { BillingService } from './billing.service';

export class PaymentService {
  private razorpay?: Razorpay;
  private billingService: BillingService;

  constructor() {
    this.billingService = new BillingService();

    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
    }
  }

  /**
   * Create Razorpay order
   */
  async createRazorpayOrder(invoiceId: string): Promise<any> {
    if (!this.razorpay) {
      throw new BadRequestError('Razorpay not configured');
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Create Razorpay order
    const order = await this.razorpay.orders.create({
      amount: Math.round(invoice.total * 100), // Convert to paise
      currency: invoice.currency,
      receipt: invoice.invoiceNumber,
      notes: {
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    // Create payment record
    const lastPayment = await Payment.findOne().sort({ createdAt: -1 });
    const paymentNumber = generateSequentialNumber('PAY', lastPayment?.paymentNumber);

    const payment = new Payment({
      paymentNumber,
      invoiceId: invoice._id,
      organizationId: invoice.organizationId,
      amount: invoice.total,
      currency: invoice.currency,
      method: PaymentMethod.RAZORPAY,
      status: PaymentStatus.PENDING,
      razorpayOrderId: order.id,
      events: [
        {
          timestamp: new Date(),
          type: 'ORDER_CREATED',
          data: order,
        },
      ],
    });

    await payment.save();

    return {
      payment,
      razorpayOrder: order,
    };
  }

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpayPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<any> {
    if (!env.RAZORPAY_KEY_SECRET) {
      throw new BadRequestError('Razorpay not configured');
    }

    // Verify signature
    const text = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestError('Invalid payment signature');
    }

    // Find payment
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Update payment
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = PaymentStatus.COMPLETED;
    payment.events.push({
      timestamp: new Date(),
      type: 'PAYMENT_VERIFIED',
      data: { razorpayPaymentId, razorpaySignature },
    });

    await payment.save();

    // Update invoice
    await this.billingService.markInvoiceAsPaid(
      payment.invoiceId.toString(),
      payment.amount
    );

    return payment;
  }

  /**
   * Handle Razorpay webhook
   */
  async handleRazorpayWebhook(event: any, signature: string): Promise<void> {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      throw new BadRequestError('Webhook secret not configured');
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(event))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestError('Invalid webhook signature');
    }

    // Process webhook event
    const { entity, event: eventType } = event.payload;

    if (eventType === 'payment.captured') {
      const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
      if (payment) {
        payment.status = PaymentStatus.COMPLETED;
        payment.razorpayPaymentId = entity.id;
        payment.events.push({
          timestamp: new Date(),
          type: 'WEBHOOK_PAYMENT_CAPTURED',
          data: entity,
        });
        await payment.save();

        await this.billingService.markInvoiceAsPaid(
          payment.invoiceId.toString(),
          payment.amount
        );
      }
    } else if (eventType === 'payment.failed') {
      const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
      if (payment) {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = entity.error_description;
        payment.events.push({
          timestamp: new Date(),
          type: 'WEBHOOK_PAYMENT_FAILED',
          data: entity,
        });
        await payment.save();
      }
    }
  }

  /**
   * Upload bank transfer receipt
   */
  async uploadBankTransferReceipt(
    invoiceId: string,
    receiptUrl: string,
    userId: string,
    transactionId?: string,
    bankName?: string
  ): Promise<any> {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    const lastPayment = await Payment.findOne().sort({ createdAt: -1 });
    const paymentNumber = generateSequentialNumber('PAY', lastPayment?.paymentNumber);

    const payment = new Payment({
      paymentNumber,
      invoiceId: invoice._id,
      organizationId: invoice.organizationId,
      amount: invoice.total,
      currency: invoice.currency,
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.VERIFICATION_REQUIRED,
      bankTransferDetails: {
        receiptUrl,
        transactionId,
        bankName,
        uploadedAt: new Date(),
        uploadedBy: userId,
      },
      events: [
        {
          timestamp: new Date(),
          type: 'RECEIPT_UPLOADED',
          data: { receiptUrl, transactionId, bankName },
        },
      ],
    });

    await payment.save();
    return payment;
  }

  /**
   * Verify bank transfer (Admin action)
   */
  async verifyBankTransfer(
    paymentId: string,
    adminUserId: string,
    approved: boolean,
    notes?: string
  ): Promise<any> {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.method !== PaymentMethod.BANK_TRANSFER) {
      throw new BadRequestError('Not a bank transfer payment');
    }

    if (approved) {
      payment.status = PaymentStatus.COMPLETED;
      if (payment.bankTransferDetails) {
        payment.bankTransferDetails.verifiedAt = new Date();
        payment.bankTransferDetails.verifiedBy = adminUserId;
        payment.bankTransferDetails.verificationNotes = notes;
      }
      payment.events.push({
        timestamp: new Date(),
        type: 'VERIFICATION_APPROVED',
        notes,
      });

      await payment.save();

      // Update invoice
      await this.billingService.markInvoiceAsPaid(
        payment.invoiceId.toString(),
        payment.amount
      );
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = notes || 'Verification rejected by admin';
      payment.events.push({
        timestamp: new Date(),
        type: 'VERIFICATION_REJECTED',
        notes,
      });
      await payment.save();
    }

    return payment;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<any> {
    const payment = await Payment.findById(paymentId)
      .populate('invoiceId')
      .populate('organizationId');

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  /**
   * Get payments by invoice
   */
  async getPaymentsByInvoice(invoiceId: string): Promise<any[]> {
    return Payment.find({ invoiceId }).sort({ createdAt: -1 });
  }

  /**
   * Get payments by organization
   */
  async getPaymentsByOrganization(
    organizationId: string,
    page = 1,
    limit = 20
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ organizationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('invoiceId'),
      Payment.countDocuments({ organizationId }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
