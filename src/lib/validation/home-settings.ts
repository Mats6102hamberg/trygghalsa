import { z } from 'zod';

export const simplicityLevelSchema = z.enum([
  'very_simple',
  'simple',
  'expanded',
]);

export const homeButtonSchema = z.object({
  button_key: z.enum([
    'medications',
    'health',
    'appointments',
    'help',
    'questions',
    'timeline',
    'contact_family',
  ]),
  label: z.string().min(1).max(50),
  is_visible: z.boolean(),
  sort_order: z.number().int().min(0).max(20),
  is_primary: z.boolean(),
});

export const homeSettingsSchema = z.object({
  simplicity_level: simplicityLevelSchema,
  today_message: z.string().max(300).nullable().optional(),
  emergency_contact_name: z.string().max(100).nullable().optional(),
  emergency_contact_phone: z.string().max(50).nullable().optional(),
  buttons: z.array(homeButtonSchema).max(10),
});

export const defaultButtons = [
  { buttonKey: 'medications', label: 'Mina mediciner', isVisible: true, sortOrder: 1, isPrimary: true },
  { buttonKey: 'health', label: 'Min hälsa', isVisible: true, sortOrder: 2, isPrimary: false },
  { buttonKey: 'appointments', label: 'Nästa besök', isVisible: true, sortOrder: 3, isPrimary: true },
  { buttonKey: 'help', label: 'Hjälp', isVisible: true, sortOrder: 4, isPrimary: true },
  { buttonKey: 'questions', label: 'Mina frågor', isVisible: false, sortOrder: 5, isPrimary: false },
  { buttonKey: 'timeline', label: 'Min tidslinje', isVisible: false, sortOrder: 6, isPrimary: false },
  { buttonKey: 'contact_family', label: 'Kontakta anhörig', isVisible: false, sortOrder: 7, isPrimary: false },
];

export type HomeButton = z.infer<typeof homeButtonSchema>;
export type HomeSettings = z.infer<typeof homeSettingsSchema>;
