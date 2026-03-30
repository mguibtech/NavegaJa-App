import {z} from 'zod';
import {TripStatus} from './tripTypes';

export const tripBoatSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  capacity: z.number(),
  photoUrl: z.string().nullable().optional(),
  photos: z.array(z.string()).optional().default([]),
  isVerified: z.boolean().default(false),
  rating: z.union([z.string(), z.number()]).optional(),
});

export const tripCaptainSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.union([z.string(), z.number()]).default(5.0),
  totalTrips: z.number().default(0),
  avatarUrl: z.string().nullable().optional(),
});

export const tripSchema = z.object({
  id: z.string(),
  origin: z.string(),
  destination: z.string(),
  departureAt: z.string(),
  estimatedArrivalAt: z.string(),
  price: z.union([z.number(), z.string()]).transform(val => Number(val)),
  cargoPriceKg: z.union([z.number(), z.string()]).nullable().optional().transform(val => val ? Number(val) : null),
  availableSeats: z.number(),
  totalSeats: z.number(),
  status: z.nativeEnum(TripStatus),
  acceptsShipments: z.boolean().optional().default(false),
  boatImageUrl: z.string().nullable().optional(),
  boatImages: z.array(z.string()).optional().default([]),
  discount: z.number().optional(),
  hasPromotion: z.boolean().optional().default(false),
  boat: tripBoatSchema.optional(),
  captain: tripCaptainSchema.optional(),
});

export const tripListSchema = z.array(tripSchema);

export type TripSchema = z.infer<typeof tripSchema>;
