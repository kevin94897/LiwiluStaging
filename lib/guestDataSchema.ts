import { z } from "zod";
import { DNI_REGEX, RUC_REGEX, CE_REGEX, PASSPORT_REGEX } from "./validations";

const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s,.-]+$/;


export const guestDataSchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es obligatorio")
        .regex(onlyLetters, "El nombre solo puede contener letras, puntos, comas y guiones"),


    apellido: z.string()
        .regex(onlyLetters, "El apellido solo puede contener letras, puntos, comas y guiones")
        .optional()
        .or(z.literal("")),


    tipoDocumento: z.enum(['DNI', 'CE', 'PASAPORTE', 'RUC'], {
        message: "Seleccione un tipo de documento"
    }),

    numeroDocumento: z.string()
        .min(1, "El número de documento es obligatorio"),

    celular: z.string()
        .min(9, "El celular debe tener al menos 9 dígitos")
        .regex(/^[0-9]+$/, "El celular solo puede contener números"),

    email: z.string()
        .min(1, "El correo electrónico es obligatorio")
        .email("Ingresa un correo electrónico válido")
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "El correo contiene caracteres no permitidos"),

    telefonoOpcional: z.string()
        .min(9, "El celular secundario debe tener 9 dígitos")
        .regex(/^[0-9]+$/, "El celular secundario solo puede contener números"),

    departamento: z.string().min(1, "El departamento es obligatorio"),

    provincia: z.string().min(1, "La provincia es obligatoria"),

    distrito: z.string().min(1, "Selecciona un distrito"),

    direccion: z.string().min(5, "La dirección es muy corta"),

    numeroDpto: z.string().min(1, "El Nro. de dpto. / Piso es obligatorio"),

    referencia: z.string().min(1, "La referencia es obligatoria"),
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
    } else if (data.tipoDocumento === 'PASAPORTE') {
        if (!PASSPORT_REGEX.test(data.numeroDocumento)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El pasaporte debe tener 1 letra y 7 números (ej. P1234567)",
                path: ["numeroDocumento"],
            });
        }
    }

    // Validate apellido is required for non-RUC document types
    if (data.tipoDocumento !== 'RUC') {
        if (!data.apellido || data.apellido.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El apellido es obligatorio",
                path: ["apellido"],
            });
        }
    }
});

export type GuestDataSchemaType = z.infer<typeof guestDataSchema>;
