import { z } from "zod";
import { DNI_REGEX, RUC_REGEX } from "./validations";

const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export const guestDataSchema = z.object({
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

    email: z.string()
        .min(1, "El correo electrónico es obligatorio")
        .email("Ingresa un correo electrónico válido"),

    telefonoOpcional: z.string().optional(),

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
});

export type GuestDataSchemaType = z.infer<typeof guestDataSchema>;
