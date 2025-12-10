import { z } from "zod";

export const registerSchema = z.object({
    firstName: z.string().min(1, "El nombre es obligatorio").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/, "El nombre solo puede contener letras"),
    lastName: z.string().min(1, "El apellido es obligatorio").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/, "El apellido solo puede contener letras"),

    email: z
        .string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido"),
    emailConfirm: z
        .string()
        .email("Ingresa un correo válido"),

    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),

    passwordConfirm: z
        .string()
        .min(6, "La confirmación debe tener 6 caracteres"),

    acceptTerms: z.boolean().refine(val => val === true, {
        message: "Debes aceptar los términos",
    }),

    receiveOffers: z.boolean().optional().default(false),
})
    .refine(data => data.email === data.emailConfirm, {
        message: "Los correos no coinciden",
        path: ["emailConfirm"],
    })
    .refine(data => data.password === data.passwordConfirm, {
        message: "Las contraseñas no coinciden",
        path: ["passwordConfirm"],
    });
