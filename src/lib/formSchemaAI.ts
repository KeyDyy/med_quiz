import { z } from "zod";

export const quizCreationSchemaAI = z.object({
  topic: z
    .string()
    .min(4, { message: "Temat musi mieć conajmniej 4 znaki" })
    .max(50),
  type: z.enum(["mcq"]),
  amount: z.number().min(1).max(3),
});
