import { z } from "zod";

const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export const carritoRegisterSchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es obligatorio")
        .regex(onlyLetters, "El nombre solo puede contener letras"),

    apellido: z.string()
        .min(1, "El apellido es obligatorio")
        .regex(onlyLetters, "El apellido solo puede contener letras"),

    tipoDocumento: z.enum(['DNI', 'CE', 'Pasaporte']),

    numeroDocumento: z.string()
        .min(8, "Número de documento inválido")
        .max(12, "Número de documento inválido"),

    celular: z.string()
        .min(9, "El celular debe tener al menos 9 dígitos")
        .regex(/^[0-9]+$/, "El celular solo puede contener números"),

    telefonoOpcional: z.string().optional(),

    departamento: z.string().min(1, "El departamento es obligatorio"),

    provincia: z.string().min(1, "La provincia es obligatoria"),

    distrito: z.string().min(1, "Selecciona un distrito"),

    direccion: z.string().min(5, "La dirección es muy corta"),

    numeroDpto: z.string().optional(),

    referencia: z.string().optional(),

    email: z.string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido"),

    password: z.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),

    confirmarPassword: z.string()
        .min(1, "Confirma tu contraseña"),
})
    .refine(data => data.password === data.confirmarPassword, {
        path: ["confirmarPassword"],
        message: "Las contraseñas no coinciden",
    });

export type CarritoRegisterSchemaType = z.infer<typeof carritoRegisterSchema>;