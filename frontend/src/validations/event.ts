import * as z from 'zod';

export const EventFormSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Event name must be at least 3 characters')
      .max(100, 'Event name cannot exceed 100 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description cannot exceed 2000 characters'),
    image: z
      .instanceof(File, { message: 'Image is required' })
      .refine(file => file.size <= 5 * 1024 * 1024, 'Max image size is 5MB')
      .refine(
        file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
        'Only .jpg, .png, and .webp formats are supported',
      ),
    isVirtual: z.boolean().default(false),
    location: z.string().max(200, 'Location cannot exceed 200 characters').optional(),
    virtualLink: z
      .string()
      .url('Invalid URL')
      .startsWith('http', 'URL must start with http:// or https://')
      .optional(),
    capacity: z
      .number()
      .int('Must be a whole number')
      .min(1, 'Capacity must be at least 1')
      .max(10000, 'Capacity cannot exceed 10,000'),
    startDate: z
      .date()
      .min(new Date(), 'Start date must be in the future')
      .refine(date => date.getHours() >= 8 && date.getHours() <= 20, {
        message: 'Events can only be scheduled between 8AM and 8PM',
      }),
    endDate: z.date().optional(),
    contactEmail: z
      .string()
      .email('Invalid email address')
      .max(100, 'Email cannot exceed 100 characters'),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  })
  .superRefine((data, ctx) => {
    if (!data.isVirtual && !data.location) {
      ctx.addIssue({
        path: ['location'],
        code: z.ZodIssueCode.custom,
        message: 'Location is required for in-person events',
      });
    }

    if (data.isVirtual && !data.virtualLink) {
      ctx.addIssue({
        path: ['virtualLink'],
        code: z.ZodIssueCode.custom,
        message: 'Virtual link is required for virtual events',
      });
    }

    if (data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        path: ['endDate'],
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
      });
    }
  });

export type EventFormValues = z.output<typeof EventFormSchema>;
