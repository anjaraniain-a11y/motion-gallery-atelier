import { createServerFn } from "@tanstack/react-start";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";

// Public write-only endpoint: no message reads or caller-controlled columns.
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: ContactInput) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("contact_submissions").insert({
        name: data.name, email: data.email, message: data.message,
      });
      return { ok: !error };
    } catch {
      return { ok: false };
    }
  });