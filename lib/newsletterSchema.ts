// lib/newsletterSchema.ts
import { z } from "zod";

export const newsletterSchema = z.object({
    email: z
        .string()
        .min(1, "El correo electrónico es obligatorio")
        .email("Ingresa un correo electrónico válido")
        .toLowerCase()
});

export type NewsletterSchemaType = z.infer<typeof newsletterSchema>;