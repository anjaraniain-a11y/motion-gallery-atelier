import { describe, expect, it } from "vitest";
import { MEDIA_CATEGORIES, selectPublicMedia } from "@/lib/media-categories";

describe("Realisation rules", () => {
  it("supports the four requested types", () => {
    expect(Object.values(MEDIA_CATEGORIES)).toEqual(["Logo", "Affiche", "Réseaux sociaux", "Autre"]);
  });
  it("filters by type across singles and project visuals", () => {
    const items = [
      { id: "single", visible: true, project_id: null, category: "logo" },
      { id: "project", visible: true, project_id: "brand", category: "logo" },
      { id: "poster", visible: true, project_id: null, category: "affiche" },
    ];
    expect(selectPublicMedia(items, [{ id: "brand", visible: true }], "logo").map(m => m.id)).toEqual(["single", "project"]);
  });
  it("never publishes a hidden visual or hidden brand project", () => {
    expect(selectPublicMedia([
      { id: "hidden", visible: false, project_id: null },
      { id: "brand", visible: true, project_id: "hidden-brand" },
      { id: "public", visible: true, project_id: null },
    ], [{ id: "hidden-brand", visible: false }]).map(m => m.id)).toEqual(["public"]);
  });
});