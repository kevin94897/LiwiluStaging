import { z } from "zod";
import { DNI_REGEX, RUC_REGEX, CE_REGEX, PASSPORT_REGEX } from "./validations";

const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s,.-]+$/;


export const carritoRegisterSchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es obligatorio")
        .regex(onlyLetters, "El nombre solo puede contener letras, puntos, comas y guiones"),


    apellido: z.string()
        .regex(onlyLetters, "El apellido solo puede contener letras, puntos, comas y guiones")
        .optional()
        .or(z.literal("")),


    tipoDocumento: z.enum(['DNI', 'CE', 'Pasaporte', 'RUC'], {
        message: "Seleccione un tipo de documento"
    }),

    numeroDocumento: z.string()
        .min(1, "El número de documento es obligatorio"),

    celular: z.string()
        .min(9, "El celular debe tener al menos 9 dígitos")
        .regex(/^[0-9]+$/, "El celular solo puede contener números"),

    telefonoOpcional: z.string()
        .regex(/^[0-9]+$/, "El teléfono opcional solo puede contener números")
        .optional()
        .or(z.literal("")),

    departamento: z.string().min(1, "El departamento es obligatorio"),

    provincia: z.string().min(1, "La provincia es obligatoria"),

    distrito: z.string().min(1, "Selecciona un distrito"),

    direccion: z.string().min(5, "La dirección es muy corta"),

    numeroDpto: z.string().optional(),

    referencia: z.string().optional(),

    email: z.string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido")
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "El correo contiene caracteres no permitidos"),

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
                message: "El DNI debe tener 8 dígitos numéricos",
                path: ["numeroDocumento"],
            });
        }
    } else if (data.tipoDocumento === 'RUC') {
        if (!RUC_REGEX.test(data.numeroDocumento)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El RUC debe tener 11 dígitos y comenzar con 10, 15 o 20",
                path: ["numeroDocumento"],
            });
        }
    } else if (data.tipoDocumento === 'CE') {
        if (!CE_REGEX.test(data.numeroDocumento)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El Carné de Extranjería debe contener entre 9 y 12 dígitos",
                path: ["numeroDocumento"],
            });
        }
    } else if (data.tipoDocumento === 'Pasaporte') {
        if (!PASSPORT_REGEX.test(data.numeroDocumento)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El pasaporte debe tener 1 letra y 7 números (ej. P1234567)",
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
