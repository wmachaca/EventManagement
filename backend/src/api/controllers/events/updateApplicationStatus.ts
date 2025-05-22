import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as eventService from '../../../services/eventService';
import type { UpdateApplicationStatusInput } from '../../../models/event';
import { isAuthenticated } from '../../../types/authenticatedRequest';

const prisma = new PrismaClient();

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const input: UpdateApplicationStatusInput = {
      applicationId: parseInt(req.params.applicationId),
      status: req.body.status,
      reviewedById: req.body.reviewedById,
    };

    const application = await prisma.eventApplication.findUnique({
      where: { id: input.applicationId },
      include: { event: true },
    });

    if (!application || application.event.creatorId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedApplication = await eventService.updateApplicationStatus(
      input.applicationId,
      input.status,
    );
    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error });
  }
};
