import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MediaCard } from "@/components/MediaCard";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("Video playback", () => {
  it("pauses playback and resumes it on request", () => {
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function () { fireEvent.pause(this); });
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function () { fireEvent.play(this); return Promise.resolve(); });
    render(<MediaCard kind="video" src="/test.mp4" title="Motion" index={0} />);
    const video = document.querySelector("video");
    if (!video) throw new Error("Video absent");
    Object.defineProperty(video, "paused", { configurable: true, value: false });
    fireEvent.click(screen.getByRole("button", { name: "Mettre en pause : Motion" }));
    expect(pause).toHaveBeenCalledOnce();
    Object.defineProperty(video, "paused", { configurable: true, value: true });
    fireEvent.click(screen.getByRole("button", { name: "Lire : Motion" }));
    expect(play).toHaveBeenCalledOnce();
  });
});