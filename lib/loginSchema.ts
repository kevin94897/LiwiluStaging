import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido"),
    password: z
        .string()
        .min(6, "La contraseña debe tener mínimo 6 caracteres"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
