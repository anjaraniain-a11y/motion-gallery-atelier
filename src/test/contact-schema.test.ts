import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";

const valid = { name: "Visiteur", email: "visiteur@example.com", message: "Projet graphique" };
describe("Contact validation", () => {
  it("accepts a visitor message and trims surrounding spaces", () => {
    expect(contactSchema.parse({ ...valid, name: " Visiteur " }).name).toBe("Visiteur");
  });
  it("rejects an invalid reply address", () => {
    expect(contactSchema.safeParse({ ...valid, email: "incorrect" }).success).toBe(false);
  });
  it("rejects empty messages", () => {
    expect(contactSchema.safeParse({ ...valid, message: "   " }).success).toBe(false);
  });
});