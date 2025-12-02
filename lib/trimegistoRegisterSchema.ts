import { z } from "zod";

const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export const trimegistoRegisterSchema = z.object({
    firstName: z.string()
        .min(1, "El nombre es obligatorio")
        .regex(onlyLetters, "El nombre solo puede contener letras"),

    lastName: z.string()
        .min(1, "El apellido es obligatorio")
        .regex(onlyLetters, "El apellido solo puede contener letras"),

    email: z.string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido"),

    emailConfirm: z.string()
        .min(1, "Este campo es obligatorio")
        .email("Ingresa un correo válido"),

    password: z.string()
        .min(6, "La contraseña debe tener mínimo 6 caracteres"),

    passwordConfirm: z.string()
        .min(1, "Confirma tu contraseña"),

    signatureFile: z.any().refine((v) => v, "La firma es obligatoria"),

    contactNumber: z.string().min(1, "Ingresa un número"),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: "Debes aceptar los términos",
    }),

    acceptDeclarations: z.boolean().refine(val => val === true, {
        message: "Debes aceptar las declaraciones",
    }),
})
    .refine(data => data.email === data.emailConfirm, {
        path: ["emailConfirm"],
        message: "Los correos no coinciden",
    })
    .refine(data => data.password === data.passwordConfirm, {
        path: ["passwordConfirm"],
        message: "Las contraseñas no coinciden",
    });
