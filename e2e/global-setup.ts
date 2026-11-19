import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fakeCamera, runtimeDir } from "../playwright.config";

/** Chromium's fake camera plays a .y4m clip: make one from a photo of a banana peel. */
export default function globalSetup() {
  fs.mkdirSync(runtimeDir, { recursive: true });
  if (fs.existsSync(fakeCamera)) return;
  const photo = path.resolve(__dirname, "fixtures/banana-peel.jpg");
  const fit = "scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2:color=0xd8d2c4";
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-loop", "1", "-i", photo, "-t", "1", "-r", "5", "-vf", fit, "-pix_fmt", "yuv420p", fakeCamera]);
}
