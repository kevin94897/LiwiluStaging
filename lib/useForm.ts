// lib/useForm.ts
import { useState } from "react";
import { ZodSchema } from "zod";

export default function useForm<T extends Record<string, unknown>>(
    initialValues: T,
    schema: ZodSchema<T>
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>(
        Object.keys(initialValues).reduce((acc, key) => {
            acc[key as keyof T] = "";
            return acc;
        }, {} as Partial<Record<keyof T, string>>)
    );

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value, type, checked } = e.target;

        setValues((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Limpiar el error del campo al escribir
        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));
    };

    const validate = () => {
        const result = schema.safeParse(values);

        if (!result.success) {
            const formatted = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof T, string>> = {};

            for (const key in formatted) {
                const errorArray = formatted[key as keyof typeof formatted];
                if (errorArray && errorArray.length > 0) {
                    newErrors[key as keyof T] = errorArray[0];
                }
            }

            setErrors(newErrors);
            return false;
        }

        setErrors({});
        return true;
    };

    return {
        values,
        errors,
        handleChange,
        validate,
        setErrors,
    };
}