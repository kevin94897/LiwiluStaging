import { z } from "zod";
import { DNI_REGEX, RUC_REGEX } from "./validations";

const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export const carritoRegisterSchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es obligatorio")
        .regex(onlyLetters, "El nombre solo puede contener letras"),

    apellido: z.string()
        .min(1, "El apellido es obligatorio")
        .regex(onlyLetters, "El apellido solo puede contener letras"),

    tipoDocumento: z.enum(['DNI', 'CE', 'Pasaporte', 'RUC']),

    numeroDocumento: z.string()
        .min(1, "El número de documento es obligatorio"),

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

    aceptoTerminos: z.boolean().refine(val => val === true, {
        message: "Debes aceptar los términos",
    }),

}).superRefine((data, ctx) => {
    if (data.tipoDocumento === 'DNI') {
        if (!DNI_REGEX.test(data.numeroDocumento)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El DNI debe tener exactamente 8 números",
                path: ["numeroDocumento"],
            });
        }
    } else if (data.tipoDocumento === 'RUC') {
        if (!RUC_REGEX.test(data.numeroDocumento)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El RUC debe tener 11 números y empezar con 20",
                path: ["numeroDocumento"],
            });
        }
    } else {
        if (data.numeroDocumento.length < 8 || data.numeroDocumento.length > 20) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Número de documento inválido",
                path: ["numeroDocumento"],
            });
        }
    }

    if (data.password !== data.confirmarPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Las contraseñas no coinciden",
            path: ["confirmarPassword"],
        });
    }
});

export type CarritoRegisterSchemaType = z.infer<typeof carritoRegisterSchema>;