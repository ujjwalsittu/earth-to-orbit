import Request, { RequestStatus } from '../models/Request';
import Lab from '../models/Lab';
import Component from '../models/Component';
import logger from '../utils/logger';

interface BookingConflict {
  itemId: string;
  itemType: 'lab' | 'component';
  requestNumber: string;
  conflictStart: Date;
  conflictEnd: Date;
}

/**
 * Check for booking conflicts
 */
export const checkBookingConflicts = async (
  itemId: string,
  itemType: 'lab' | 'component',
  startDate: Date,
  endDate: Date,
  quantity = 1,
  excludeRequestId?: string
): Promise<BookingConflict[]> => {
  try {
    // Find overlapping bookings
    const query: any = {
      'items.item': itemId,
      'items.itemType': itemType,
      status: {
        $in: [
          RequestStatus.SUBMITTED,
          RequestStatus.UNDER_REVIEW,
          RequestStatus.APPROVED,
          RequestStatus.IN_PROGRESS,
        ],
      },
      $or: [
        {
          'items.startDate': { $lte: endDate },
          'items.endDate': { $gte: startDate },
        },
      ],
    };

    if (excludeRequestId) {
      query._id = { $ne: excludeRequestId };
    }

    const conflictingRequests = await Request.find(query).select('requestNumber items');

    const conflicts: BookingConflict[] = [];

    // For components, check if enough quantity is available
    if (itemType === 'component') {
      const component = await Component.findById(itemId);
      if (!component) {
        throw new Error('Component not found');
      }

      // Calculate total quantity booked for each overlapping period
      for (const request of conflictingRequests) {
        const overlappingItem = request.items.find(
          (item) => item.item.toString() === itemId && item.itemType === itemType
        );

        if (overlappingItem) {
          const bookedQuantity = overlappingItem.quantity;

          // Check if adding this booking would exceed available quantity
          if (component.availableQuantity < quantity + bookedQuantity) {
            conflicts.push({
              itemId,
              itemType,
              requestNumber: request.requestNumber,
              conflictStart: overlappingItem.startDate,
              conflictEnd: overlappingItem.endDate,
            });
          }
        }
      }
    } else {
      // For labs, any overlap is a conflict (labs can't be shared)
      for (const request of conflictingRequests) {
        const overlappingItem = request.items.find(
          (item) => item.item.toString() === itemId && item.itemType === itemType
        );

        if (overlappingItem) {
          conflicts.push({
            itemId,
            itemType,
            requestNumber: request.requestNumber,
            conflictStart: overlappingItem.startDate,
            conflictEnd: overlappingItem.endDate,
          });
        }
      }
    }

    return conflicts;
  } catch (error: any) {
    logger.error('Failed to check booking conflicts:', error);
    throw new Error(`Failed to check booking conflicts: ${error.message}`);
  }
};

/**
 * Get availability calendar for an item
 */
export const getAvailability = async (
  itemId: string,
  itemType: 'lab' | 'component',
  startDate: Date,
  endDate: Date
): Promise<{ available: boolean; bookedSlots: Array<{ start: Date; end: Date }> }> => {
  try {
    const conflicts = await checkBookingConflicts(itemId, itemType, startDate, endDate);

    const bookedSlots = conflicts.map((conflict) => ({
      start: conflict.conflictStart,
      end: conflict.conflictEnd,
    }));

    return {
      available: conflicts.length === 0,
      bookedSlots,
    };
  } catch (error: any) {
    logger.error('Failed to get availability:', error);
    throw new Error(`Failed to get availability: ${error.message}`);
  }
};

/**
 * Calculate booking duration in days
 */
export const calculateDays = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Validate booking dates
 */
export const validateBookingDates = (startDate: Date, endDate: Date, leadTimeDays = 7): void => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Start date must be in the future
  if (start <= now) {
    throw new Error('Start date must be in the future');
  }

  // End date must be after start date
  if (end <= start) {
    throw new Error('End date must be after start date');
  }

  // Check lead time
  const leadTime = new Date(now.getTime() + leadTimeDays * 24 * 60 * 60 * 1000);
  if (start < leadTime) {
    throw new Error(`Booking requires at least ${leadTimeDays} days lead time`);
  }
};

export default {
  checkBookingConflicts,
  getAvailability,
  calculateDays,
  validateBookingDates,
};
