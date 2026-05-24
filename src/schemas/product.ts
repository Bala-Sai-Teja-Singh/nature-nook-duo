import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  breed: z.string().min(2, 'Breed must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  images: z.array(z.string().url('Invalid image URL')),
  mainCategory: z.string().min(1, 'Category is required'),
  careLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  humidity: z.string().min(1, 'Required'),
  temperature: z.string().min(1, 'Required'),
  feeding: z.string().min(1, 'Required'),
  isVisible: z.boolean().default(true),
  available: z.boolean().default(true),
  
  sizes: z.array(z.object({
    size: z.string().min(1, 'Required'),
    price: z.number().min(0, 'Price cannot be negative'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
  })).min(1, 'At least one size is required'),

  customMeta: z.record(z.string(), z.any()).optional(),
});

export type ProductSchemaType = z.infer<typeof ProductSchema>;
