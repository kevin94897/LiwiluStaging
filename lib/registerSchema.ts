import { z } from "zod";

export const registerSchema = z.object({
    firstName: z.string().min(1, "El nombre es obligatorio").regex(/^[a-zA-Z ]+$/, "El nombre solo puede contener letras"),
    lastName: z.string().min(1, "El apellido es obligatorio").regex(/^[a-zA-Z ]+$/, "El apellido solo puede contener letras"),

    email: z
        .string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido"),
    emailConfirm: z
        .string()
        .email("Ingresa un correo válido"),

    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),

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
