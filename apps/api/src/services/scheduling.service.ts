import Request, { RequestStatus } from '../models/Request';
import Lab from '../models/Lab';
import Component from '../models/Component';
import Site from '../models/Site';
import logger from '../utils/logger';

interface TimeSlotConflict {
  labId: string;
  siteId: string;
  requestNumber: string;
  conflictStart: Date;
  conflictEnd: Date;
}

interface AlternativeSlot {
  startTime: Date;
  endTime: Date;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Calculate duration in hours between two dates
 */
export const calculateHours = (startTime: Date, endTime: Date): number => {
  const diffMs = endTime.getTime() - startTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.max(0, diffHours);
};

/**
 * Calculate duration in minutes
 */
export const calculateMinutes = (startTime: Date, endTime: Date): number => {
  const diffMs = endTime.getTime() - startTime.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return Math.max(0, diffMinutes);
};

/**
 * Validate time slot against lab's granularity and operating hours
 */
export const validateTimeSlot = async (
  labId: string,
  startTime: Date,
  endTime: Date
): Promise<void> => {
  const lab = await Lab.findById(labId);
  if (!lab) {
    throw new Error('Lab not found');
  }

  // Check if duration matches slot granularity
  const durationMinutes = calculateMinutes(startTime, endTime);
  if (durationMinutes % lab.slotGranularityMinutes !== 0) {
    throw new Error(
      `Booking duration must be in ${lab.slotGranularityMinutes}-minute increments`
    );
  }

  // Check against operating hours
  const startHour = startTime.getHours();
  const startMinute = startTime.getMinutes();
  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();

  const [opStart, opEnd] = lab.operatingWindow.start.split(':').map(Number);
  const [opEndHour, opEndMinute] = lab.operatingWindow.end.split(':').map(Number);

  const startTimeMinutes = startHour * 60 + startMinute;
  const endTimeMinutes = endHour * 60 + endMinute;
  const opStartMinutes = opStart * 60;
  const opEndMinutes = opEndHour * 60 + opEndMinute;

  if (startTimeMinutes < opStartMinutes || endTimeMinutes > opEndMinutes) {
    throw new Error(
      `Booking must be within operating hours: ${lab.operatingWindow.start} - ${lab.operatingWindow.end}`
    );
  }

  // Check lead time
  const now = new Date();
  const leadTimeMs = lab.leadTimeDays * 24 * 60 * 60 * 1000;
  if (startTime.getTime() - now.getTime() < leadTimeMs) {
    throw new Error(`Booking requires at least ${lab.leadTimeDays} days advance notice`);
  }

  // Check if start is in the past
  if (startTime <= now) {
    throw new Error('Start time must be in the future');
  }

  // Check if end is after start
  if (endTime <= startTime) {
    throw new Error('End time must be after start time');
  }
};

/**
 * Check for machinery booking conflicts
 */
export const checkMachineryConflicts = async (
  labId: string,
  siteId: string,
  startTime: Date,
  endTime: Date,
  excludeRequestId?: string
): Promise<TimeSlotConflict[]> => {
  try {
    // Find overlapping bookings for this specific lab at this site
    const query: any = {
      'machineryItems.lab': labId,
      'machineryItems.site': siteId,
      status: {
        $in: [
          RequestStatus.SUBMITTED,
          RequestStatus.UNDER_REVIEW,
          RequestStatus.APPROVED,
          RequestStatus.SCHEDULED,
          RequestStatus.IN_PROGRESS,
        ],
      },
    };

    if (excludeRequestId) {
      query._id = { $ne: excludeRequestId };
    }

    const requests = await Request.find(query).select('requestNumber machineryItems');

    const conflicts: TimeSlotConflict[] = [];

    for (const request of requests) {
      for (const item of request.machineryItems) {
        // Check if this specific machinery item matches our lab and site
        if (
          item.lab.toString() === labId &&
          item.site.toString() === siteId
        ) {
          // Check for time overlap
          if (
            (startTime >= item.startTime && startTime < item.endTime) ||
            (endTime > item.startTime && endTime <= item.endTime) ||
            (startTime <= item.startTime && endTime >= item.endTime)
          ) {
            conflicts.push({
              labId,
              siteId,
              requestNumber: request.requestNumber,
              conflictStart: item.startTime,
              conflictEnd: item.endTime,
            });
          }
        }
      }
    }

    return conflicts;
  } catch (error: any) {
    logger.error('Failed to check machinery conflicts:', error);
    throw new Error(`Failed to check conflicts: ${error.message}`);
  }
};

/**
 * Check if a lab is available for a given time slot
 */
export const isLabAvailable = async (
  labId: string,
  siteId: string,
  startTime: Date,
  endTime: Date,
  excludeRequestId?: string
): Promise<boolean> => {
  const conflicts = await checkMachineryConflicts(
    labId,
    siteId,
    startTime,
    endTime,
    excludeRequestId
  );
  return conflicts.length === 0;
};

/**
 * Find alternative time slots if requested slot is unavailable
 */
export const findAlternativeSlots = async (
  labId: string,
  siteId: string,
  requestedStart: Date,
  durationHours: number,
  maxAlternatives = 5
): Promise<AlternativeSlot[]> => {
  try {
    const lab = await Lab.findById(labId);
    if (!lab) {
      throw new Error('Lab not found');
    }

    const alternatives: AlternativeSlot[] = [];
    const durationMs = durationHours * 60 * 60 * 1000;

    // Search window: 7 days before and after requested date
    const searchDays = 7;

    // Try same day, different hours first (high confidence)
    const sameDay = new Date(requestedStart);
    sameDay.setHours(0, 0, 0, 0);

    for (let hourOffset = 1; hourOffset <= 8; hourOffset++) {
      if (alternatives.length >= maxAlternatives) break;

      // Try later on same day
      const laterStart = new Date(requestedStart.getTime() + hourOffset * 60 * 60 * 1000);
      const laterEnd = new Date(laterStart.getTime() + durationMs);

      if (await isLabAvailable(labId, siteId, laterStart, laterEnd)) {
        alternatives.push({
          startTime: laterStart,
          endTime: laterEnd,
          confidence: 'high',
        });
      }

      // Try earlier on same day
      const earlierStart = new Date(requestedStart.getTime() - hourOffset * 60 * 60 * 1000);
      const earlierEnd = new Date(earlierStart.getTime() + durationMs);

      if (earlierStart.getTime() > Date.now() && await isLabAvailable(labId, siteId, earlierStart, earlierEnd)) {
        alternatives.push({
          startTime: earlierStart,
          endTime: earlierEnd,
          confidence: 'high',
        });
      }
    }

    // Try adjacent days (medium confidence)
    for (let dayOffset = 1; dayOffset <= searchDays; dayOffset++) {
      if (alternatives.length >= maxAlternatives) break;

      // Next day
      const nextDayStart = new Date(requestedStart.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const nextDayEnd = new Date(nextDayStart.getTime() + durationMs);

      if (await isLabAvailable(labId, siteId, nextDayStart, nextDayEnd)) {
        alternatives.push({
          startTime: nextDayStart,
          endTime: nextDayEnd,
          confidence: dayOffset <= 2 ? 'medium' : 'low',
        });
      }

      // Previous day
      const prevDayStart = new Date(requestedStart.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const prevDayEnd = new Date(prevDayStart.getTime() + durationMs);

      if (
        prevDayStart.getTime() > Date.now() &&
        await isLabAvailable(labId, siteId, prevDayStart, prevDayEnd)
      ) {
        alternatives.push({
          startTime: prevDayStart,
          endTime: prevDayEnd,
          confidence: dayOffset <= 2 ? 'medium' : 'low',
        });
      }
    }

    return alternatives.slice(0, maxAlternatives);
  } catch (error: any) {
    logger.error('Failed to find alternative slots:', error);
    throw new Error(`Failed to find alternatives: ${error.message}`);
  }
};

/**
 * Check component availability
 */
export const checkComponentAvailability = async (
  componentId: string,
  quantity: number
): Promise<{ available: boolean; availableQuantity: number }> => {
  const component = await Component.findById(componentId);
  if (!component) {
    throw new Error('Component not found');
  }

  return {
    available: component.availableQuantity >= quantity,
    availableQuantity: component.availableQuantity,
  };
};

/**
 * Validate booking dates and times
 */
export const validateBookingDates = (startTime: Date, endTime: Date): void => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Start time must be in the future
  if (start <= now) {
    throw new Error('Start time must be in the future');
  }

  // End time must be after start time
  if (end <= start) {
    throw new Error('End time must be after start time');
  }

  // Reasonable duration check (max 30 days)
  const durationHours = calculateHours(start, end);
  if (durationHours > 24 * 30) {
    throw new Error('Booking duration cannot exceed 30 days');
  }
};

/**
 * Get availability for an item (backwards compatibility)
 */
export const getAvailability = async (
  itemId: string,
  itemType: 'lab' | 'component',
  startTime: Date,
  endTime: Date
): Promise<{
  available: boolean;
  reason?: string;
  alternatives?: AlternativeSlot[];
}> => {
  if (itemType === 'lab') {
    const lab = await Lab.findById(itemId);
    if (!lab) {
      return { available: false, reason: 'Lab not found' };
    }

    // Need site for lab availability check
    // For this generic check, we'll just validate the time slot
    try {
      await validateTimeSlot(itemId, startTime, endTime);
      return { available: true };
    } catch (error: any) {
      return {
        available: false,
        reason: error.message,
      };
    }
  } else {
    // Component
    const component = await Component.findById(itemId);
    if (!component) {
      return { available: false, reason: 'Component not found' };
    }

    const availability = await checkComponentAvailability(itemId, 1);
    return {
      available: availability.available,
      reason: availability.available
        ? undefined
        : `Only ${availability.availableQuantity} units available`,
    };
  }
};

export default {
  calculateHours,
  calculateMinutes,
  validateTimeSlot,
  checkMachineryConflicts,
  isLabAvailable,
  findAlternativeSlots,
  checkComponentAvailability,
  validateBookingDates,
  getAvailability,
};
