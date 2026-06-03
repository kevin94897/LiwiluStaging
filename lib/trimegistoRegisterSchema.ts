import { z } from "zod";

const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜüÏïÄäÖö\s,.-]+$/;


export const trimegistoRegisterSchema = z.object({
    dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
    firstName: z.string()
        .min(1, "El nombre es obligatorio")
        .regex(onlyLetters, "El nombre solo puede contener letras, puntos, comas y guiones"),


    lastName: z.string()
        .min(1, "El apellido es obligatorio")
        .regex(onlyLetters, "El apellido solo puede contener letras, puntos, comas y guiones"),


    email: z.string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido"),

    emailConfirm: z.string()
        .min(1, "Este campo es obligatorio")
        .email("Ingresa un correo válido"),

    password: z.string()
        .min(6, "La contraseña debe tener mínimo 6 caracteres")
        .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
        .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
        .regex(/[0-9]/, "La contraseña debe contener al menos un número"),

    passwordConfirm: z.string()
        .min(1, "Confirma tu contraseña"),

    signatureFile: z.any()
        .refine((v) => v, "La firma es obligatoria")
        .refine(
            (file) => !file || (file.type && file.type.startsWith("image/")),
            "Solo se permiten imágenes (PNG, JPG)"
        )
        .refine(
            (file) => !file || file.size <= 716800,
            "El archivo de la firma no debe superar 700 KB"
        ),

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
