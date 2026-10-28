import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Indiquez votre nom.").max(100, "Le nom est trop long."),
  email: z.string().trim().email("Indiquez une adresse email valide.").max(255),
  message: z.string().trim().min(1, "Écrivez votre message.").max(5000, "Le message est trop long."),
});

export type ContactInput = z.infer<typeof contactSchema>;