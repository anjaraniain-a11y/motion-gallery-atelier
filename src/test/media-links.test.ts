import { describe, expect, it } from "vitest";
import { cloudinaryLink, kindFromLink, isStudioShortcut } from "@/lib/media-links";

describe("Cloudinary links", () => {
  it("accepts a direct image link", () => {
    expect(cloudinaryLink.parse(" https://res.cloudinary.com/vdr0t4kc/image/upload/v1/logo.jpg ")).toBe("https://res.cloudinary.com/vdr0t4kc/image/upload/v1/logo.jpg");
    expect(kindFromLink("https://res.cloudinary.com/vdr0t4kc/image/upload/logo.jpg")).toBe("image");
  });
  it("recognizes a video link", () => {
    expect(kindFromLink("https://res.cloudinary.com/vdr0t4kc/video/upload/motion.mp4")).toBe("video");
  });
  it("rejects non-Cloudinary and insecure links", () => {
    expect(cloudinaryLink.safeParse("https://example.com/image.jpg").success).toBe(false);
    expect(cloudinaryLink.safeParse("http://res.cloudinary.com/vdr0t4kc/image/upload/logo.jpg").success).toBe(false);
  });
});
describe("Studio shortcut", () => {
  it("requires Ctrl+Shift+A", () => {
    const event = { ctrlKey: true, shiftKey: true, altKey: false, repeat: false, key: "A" };
    expect(isStudioShortcut(event)).toBe(true);
    expect(isStudioShortcut({ ...event, shiftKey: false })).toBe(false);
    expect(isStudioShortcut({ ...event, key: "b" })).toBe(false);
  });
});