import Invoice, { IInvoice, InvoiceStatus } from '../models/Invoice';
import Request, { IRequest } from '../models/Request';
import Organization from '../models/Organization';
import { generateInvoiceNumber } from '../utils/generate-number';
import logger from '../utils/logger';

/**
 * Generate invoice from approved request
 */
export const generateInvoice = async (request: IRequest): Promise<IInvoice> => {
  try {
    // Get organization for billing address
    const organization = await Organization.findById(request.organization);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get the next invoice sequence number
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const sequenceNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[2]) + 1 : 1;

    const invoiceNumber = generateInvoiceNumber(sequenceNumber);

    // Prepare invoice items from request
    const items = [];

    // Add machinery items
    if (request.machineryItems && request.machineryItems.length > 0) {
      for (const item of request.machineryItems) {
        const labDoc = await require('../models/Lab').default.findById(item.lab);
        items.push({
          description: `Lab: ${labDoc?.name || 'Unknown'} - ${item.durationHours} hour(s)`,
          quantity: item.durationHours,
          unitPrice: item.rateSnapshot,
          amount: item.subtotal,
        });
      }
    }

    // Add component items
    if (request.components && request.components.length > 0) {
      for (const item of request.components) {
        const componentDoc = await require('../models/Component').default.findById(item.component);
        items.push({
          description: `Component: ${componentDoc?.name || 'Unknown'} - ${item.quantity} unit(s)`,
          quantity: item.quantity,
          unitPrice: item.priceSnapshot,
          amount: item.subtotal,
        });
      }
    }

    // Add assistance items
    if (request.assistanceItems && request.assistanceItems.length > 0) {
      for (const item of request.assistanceItems) {
        items.push({
          description: `Technical Assistance - ${item.hours} hour(s)`,
          quantity: item.hours,
          unitPrice: item.rateSnapshot || 0,
          amount: item.subtotal,
        });
      }
    }

    // Calculate tax (18% GST)
    const taxRate = 18;
    const subtotal = request.subtotal;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // Use billing address if available, otherwise use primary address
    const billingAddress = organization.billingAddress || organization.address;

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      request: request._id,
      organization: request.organization,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      currency: request.currency,
      status: InvoiceStatus.SENT,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      billingAddress: {
        name: organization.legalName,
        street: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        country: billingAddress.country,
        postalCode: billingAddress.postalCode,
      },
      notes: 'Payment due within 30 days. Late payments may incur additional charges.',
    });

    logger.info(`Invoice ${invoiceNumber} generated for request ${request.requestNumber}`);

    return invoice;
  } catch (error: any) {
    logger.error('Failed to generate invoice:', error);
    throw new Error(`Failed to generate invoice: ${error.message}`);
  }
};

/**
 * Mark invoice as paid
 */
export const markInvoiceAsPaid = async (invoiceId: string): Promise<IInvoice> => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  invoice.status = InvoiceStatus.PAID;
  invoice.paidDate = new Date();
  await invoice.save();

  logger.info(`Invoice ${invoice.invoiceNumber} marked as paid`);

  return invoice;
};

/**
 * Check and update overdue invoices
 */
export const updateOverdueInvoices = async (): Promise<void> => {
  const now = new Date();
  const result = await Invoice.updateMany(
    {
      status: { $in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID] },
      dueDate: { $lt: now },
    },
    {
      $set: { status: InvoiceStatus.OVERDUE },
    }
  );

  logger.info(`Updated ${result.modifiedCount} overdue invoices`);
};

export default {
  generateInvoice,
  markInvoiceAsPaid,
  updateOverdueInvoices,
};
