// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MusicPlayer from "./MusicPlayer";

function mockMedia(playOutcome: "ok" | DOMException) {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    if (playOutcome !== "ok") return Promise.reject(playOutcome);
    Object.defineProperty(this, "paused", { configurable: true, get: () => false });
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, "paused", { configurable: true, get: () => true });
    this.dispatchEvent(new Event("pause"));
  });
}
beforeEach(() => vi.restoreAllMocks());

describe("MusicPlayer", () => {
  it("does not download the multi-MB track until someone presses play", () => {
    const { container } = render(<MusicPlayer />);
    const audio = container.querySelector("audio");
    expect(audio).toHaveAttribute("preload", "none");
    expect(audio).toHaveAttribute("src", "/assets/music/birthday-song.mp3");
  });

  it("toggles between play and pause and reflects it in aria-pressed", async () => {
    mockMedia("ok");
    const user = userEvent.setup();
    render(<MusicPlayer />);
    const button = screen.getByRole("button", { name: "Phát nhạc" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(screen.getByRole("button", { name: "Tạm dừng nhạc" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Đang phát bản nhạc của tụi mình")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tạm dừng nhạc" }));
    expect(screen.getByRole("button", { name: "Phát nhạc" })).toBeInTheDocument();
  });

  it("explains an autoplay-policy refusal as a retryable hiccup", async () => {
    mockMedia(new DOMException("blocked", "NotAllowedError"));
    const user = userEvent.setup();
    render(<MusicPlayer />);
    await user.click(screen.getByRole("button", { name: "Phát nhạc" }));
    expect(screen.getByRole("status")).toHaveTextContent("thử bấm lại nhé");
  });

  it("explains a missing or unsupported file differently (it will not fix itself on retry)", async () => {
    mockMedia(new DOMException("no source", "NotSupportedError"));
    const user = userEvent.setup();
    render(<MusicPlayer />);
    await user.click(screen.getByRole("button", { name: "Phát nhạc" }));
    expect(screen.getByRole("status")).toHaveTextContent("chưa sẵn sàng");
  });

  it("surfaces a media error event (e.g. 404) and stops showing 'playing'", () => {
    const { container } = render(<MusicPlayer />);
    fireEvent.error(container.querySelector("audio") as HTMLAudioElement);
    expect(screen.getByRole("status")).toHaveTextContent("chưa sẵn sàng");
    expect(screen.getByRole("button", { name: "Phát nhạc" })).toBeInTheDocument();
  });
});
