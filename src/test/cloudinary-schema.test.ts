import { describe, it, expect } from "vitest";
import { encodeMetadata, decodeMetadata, mediaMetadata, defaultMediaMetadata } from "../lib/cloudinary-schema";

describe("Cloudinary metadata", () => {
  it("preserves title, description, category, project and order through encoding", () => {
    const m = { ...defaultMediaMetadata, title: "Été | = 東京", description: "Affiche\ncréative", category: "affiche" as const, project_id: "brand-1", sort: 7 };
    expect(mediaMetadata.parse(decodeMetadata(encodeMetadata(m)))).toEqual(m);
  });
  it("preserves visibility, home selection and size when replacing media", () => {
    const m = { ...defaultMediaMetadata, visible: false, featured: true, size_class: "grand" as const };
    expect(mediaMetadata.parse({ ...m, id: "new-file", url: "new-url" })).toEqual(m);
  });
  it("rejects unknown realization categories", () => {
    expect(mediaMetadata.safeParse({ ...defaultMediaMetadata, category: "unknown" }).success).toBe(false);
  });
});