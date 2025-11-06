import { DateTime } from 'luxon';
import { Request as RequestDoc } from '../models/Request';
import { Lab } from '../models/Lab';
import { Site } from '../models/Site';
import { RequestStatus } from '@e2o/types';
import { BadRequestError, NotFoundError } from '../utils/api-error';

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface AvailabilityCheck {
  labId: string;
  siteId: string;
  requestedStart: Date;
  requestedEnd: Date;
  isAvailable: boolean;
  conflicts?: any[];
  alternatives?: TimeSlot[];
}

export class SchedulingService {
  /**
   * Check if a lab is available for a given time slot
   */
  async checkAvailability(
    labId: string,
    siteId: string,
    start: Date,
    end: Date,
    excludeRequestId?: string
  ): Promise<AvailabilityCheck> {
    const lab = await Lab.findById(labId);
    if (!lab) {
      throw new NotFoundError('Lab not found');
    }

    const site = await Site.findById(siteId);
    if (!site) {
      throw new NotFoundError('Site not found');
    }

    // Convert to site timezone
    const startDT = DateTime.fromJSDate(start).setZone(site.timezone);
    const endDT = DateTime.fromJSDate(end).setZone(site.timezone);

    // Check operating hours
    const [opStartHour, opStartMin] = site.operatingHours.start.split(':').map(Number);
    const [opEndHour, opEndMin] = site.operatingHours.end.split(':').map(Number);

    const requestStartTime = startDT.hour * 60 + startDT.minute;
    const requestEndTime = endDT.hour * 60 + endDT.minute;
    const opStart = opStartHour * 60 + opStartMin;
    const opEnd = opEndHour * 60 + opEndMin;

    if (requestStartTime < opStart || requestEndTime > opEnd) {
      throw new BadRequestError(
        `Requested time is outside operating hours (${site.operatingHours.start} - ${site.operatingHours.end})`
      );
    }

    // Check for existing bookings
    const query: any = {
      'machineryItems.labId': labId,
      'machineryItems.siteId': siteId,
      status: {
        $in: [
          RequestStatus.APPROVED,
          RequestStatus.SCHEDULED,
          RequestStatus.IN_PROGRESS,
          RequestStatus.COMPLETED,
        ],
      },
      $or: [
        {
          'machineryItems.scheduledStart': { $lt: end },
          'machineryItems.scheduledEnd': { $gt: start },
        },
      ],
    };

    if (excludeRequestId) {
      query._id = { $ne: excludeRequestId };
    }

    const conflicts = await RequestDoc.find(query);

    const isAvailable = conflicts.length === 0;

    // Generate alternatives if not available
    let alternatives: TimeSlot[] = [];
    if (!isAvailable) {
      alternatives = await this.findAlternativeSlots(labId, siteId, start, end, site.timezone);
    }

    return {
      labId,
      siteId,
      requestedStart: start,
      requestedEnd: end,
      isAvailable,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      alternatives: alternatives.length > 0 ? alternatives : undefined,
    };
  }

  /**
   * Find alternative time slots if requested slot is unavailable
   */
  async findAlternativeSlots(
    labId: string,
    siteId: string,
    requestedStart: Date,
    requestedEnd: Date,
    timezone: string,
    maxAlternatives = 5
  ): Promise<TimeSlot[]> {
    const duration = (requestedEnd.getTime() - requestedStart.getTime()) / (1000 * 60 * 60); // hours
    const alternatives: TimeSlot[] = [];

    const startDT = DateTime.fromJSDate(requestedStart).setZone(timezone);

    // Try ±3 hours same day
    const sameDayOffsets = [-3, -2, -1, 1, 2, 3];
    for (const offset of sameDayOffsets) {
      const altStart = startDT.plus({ hours: offset }).toJSDate();
      const altEnd = DateTime.fromJSDate(altStart)
        .plus({ hours: duration })
        .toJSDate();

      const check = await this.checkAvailability(labId, siteId, altStart, altEnd);
      if (check.isAvailable) {
        alternatives.push({ start: altStart, end: altEnd });
        if (alternatives.length >= maxAlternatives) break;
      }
    }

    // Try next 3 days at same time
    if (alternatives.length < maxAlternatives) {
      for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
        const altStart = startDT.plus({ days: dayOffset }).toJSDate();
        const altEnd = DateTime.fromJSDate(altStart)
          .plus({ hours: duration })
          .toJSDate();

        const check = await this.checkAvailability(labId, siteId, altStart, altEnd);
        if (check.isAvailable) {
          alternatives.push({ start: altStart, end: altEnd });
          if (alternatives.length >= maxAlternatives) break;
        }
      }
    }

    return alternatives;
  }

  /**
   * Check if extension is possible
   */
  async checkExtensionAvailability(
    requestId: string,
    additionalHours: number
  ): Promise<AvailabilityCheck[]> {
    const request = await RequestDoc.findById(requestId);
    if (!request) {
      throw new NotFoundError('Request not found');
    }

    if (!request.scheduledEnd) {
      throw new BadRequestError('Request has no scheduled end time');
    }

    const results: AvailabilityCheck[] = [];

    for (const item of request.machineryItems) {
      if (!item.scheduledEnd) continue;

      const newEnd = DateTime.fromJSDate(item.scheduledEnd)
        .plus({ hours: additionalHours })
        .toJSDate();

      const check = await this.checkAvailability(
        item.labId.toString(),
        item.siteId.toString(),
        item.scheduledEnd,
        newEnd,
        requestId
      );

      results.push(check);
    }

    return results;
  }

  /**
   * Get calendar view of bookings for a site/lab
   */
  async getCalendarView(
    labId?: string,
    siteId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    const start = startDate || new Date();
    const end =
      endDate || DateTime.fromJSDate(start).plus({ days: 30 }).toJSDate();

    const query: any = {
      status: {
        $in: [
          RequestStatus.APPROVED,
          RequestStatus.SCHEDULED,
          RequestStatus.IN_PROGRESS,
        ],
      },
      'machineryItems.scheduledStart': { $lte: end },
      'machineryItems.scheduledEnd': { $gte: start },
    };

    if (labId) {
      query['machineryItems.labId'] = labId;
    }

    if (siteId) {
      query['machineryItems.siteId'] = siteId;
    }

    const bookings = await RequestDoc.find(query)
      .populate('organizationId', 'name')
      .populate('machineryItems.labId', 'name code')
      .populate('machineryItems.siteId', 'name code')
      .select('requestNumber title machineryItems status scheduledStart scheduledEnd');

    return bookings;
  }
}
