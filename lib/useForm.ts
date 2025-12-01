import { useState } from "react";

export default function useForm(initialValues: any) {
    const [values, setValues] = useState(initialValues);

    const [errors, setErrors] = useState(
        Object.keys(initialValues).reduce((acc: any, key) => {
            acc[key] = "";
            return acc;
        }, {})
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setValues({ ...values, [name]: value });

        // limpiamos error en tiempo real
        setErrors({ ...errors, [name]: "" });
    };

    const validateRequired = () => {
        let newErrors: any = {};
        let hasError = false;

        Object.keys(values).forEach((key) => {
            if (!values[key]) {
                newErrors[key] = "Este campo es obligatorio";
                hasError = true;
            } else {
                newErrors[key] = "";
            }
        });

        setErrors(newErrors);
        return !hasError;
    };

    return {
        values,
        errors,
        handleChange,
        validateRequired,
    };
}
