import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido")
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "El correo contiene caracteres no permitidos"),
    password: z
        .string()
        .min(6, "La contraseña debe tener mínimo 6 caracteres"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
