import { z } from "zod";
import { dniValidation } from "./validations";

export const dniSchema = z.object({
    dni: dniValidation
});
