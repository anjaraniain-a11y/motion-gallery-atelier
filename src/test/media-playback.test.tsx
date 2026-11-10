import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MediaCard } from "@/components/MediaCard";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("Video playback", () => {
  it("changes the volume and mutes at zero", () => {
    render(<MediaCard kind="video" src="/test.mp4" title="Motion" index={0} />);
    const video = document.querySelector("video");
    if (!video) throw new Error("Video absent");
    fireEvent.change(screen.getByRole("slider", { name: "Volume : Motion" }), { target: { value: "0.75" } });
    expect(video.volume).toBe(0.75);
    expect(video.muted).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Couper le son : Motion" }));
    expect(video.volume).toBe(0);
    expect(video.muted).toBe(true);
  });
  it("pauses playback and resumes it on request", async () => {
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) { fireEvent.pause(this); });
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) { fireEvent.play(this); return Promise.resolve(); });
    render(<MediaCard kind="video" src="/test.mp4" title="Motion" index={0} />);
    const video = document.querySelector("video");
    if (!video) throw new Error("Video absent");
    Object.defineProperty(video, "paused", { configurable: true, value: false });
    fireEvent.click(screen.getByRole("button", { name: "Mettre en pause : Motion" }));
    expect(pause).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Lire : Motion" })).toBeEnabled();
    Object.defineProperty(video, "paused", { configurable: true, value: true });
    fireEvent.click(screen.getByRole("button", { name: "Lire : Motion" }));
    await waitFor(() => expect(play).toHaveBeenCalledOnce());
    expect(screen.getByRole("button", { name: "Mettre en pause : Motion" })).toBeEnabled();
  });
  it("keeps resume available when the browser refuses playback", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(new Error("Playback blocked"));
    render(<MediaCard kind="video" src="/test.mp4" title="Motion" index={0} />);
    const video = document.querySelector("video");
    if (!video) throw new Error("Video absent");
    Object.defineProperty(video, "paused", { configurable: true, value: true });
    fireEvent.pause(video);
    fireEvent.click(screen.getByRole("button", { name: "Lire : Motion" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Lire : Motion" })).toBeEnabled());
  });
});