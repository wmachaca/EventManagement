import type { Request, Response } from 'express';
import { PrismaClient, ApplicationStatus } from '@prisma/client';
import * as eventService from '../../../services/eventService';
import type { UpdateApplicationStatusInput } from '../../../models/event';
import { isAuthenticated } from '../../../types/authenticatedRequest';

const prisma = new PrismaClient();

const validStatuses = Object.values(ApplicationStatus);

// Transitions
const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  PENDING: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
  APPROVED: [],
  REJECTED: [],
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Parse and validate applicationId param
    const applicationId = parseInt(req.params.applicationId, 10);
    if (isNaN(applicationId)) {
      return res.status(400).json({ message: 'Invalid application ID' });
    }

    // Validate status in request body
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        validStatuses,
      });
    }

    const reviewerId = req.user.userId;

    const application = await prisma.eventApplication.findUnique({
      where: { id: applicationId },
      include: { event: true },
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user is authorized (only event creator can update)
    if (application.event.creatorId !== reviewerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (application.event.status === 'DRAFT') {
      return res.status(403).json({ message: 'Cannot update application status for draft events' });
    }

    // Check if the status transition is valid
    const currentStatus = application.status as ApplicationStatus;
    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status transition',
        currentStatus,
        validTransitions: validTransitions[currentStatus],
      });
    }

    // Proceed to update the application status
    const updatedApplication = await eventService.updateApplicationStatus(
      applicationId,
      status,
      reviewerId,
    );
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status', error });
  }
};
