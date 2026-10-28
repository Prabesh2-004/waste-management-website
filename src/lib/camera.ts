"use client";

import { useEffect, useRef, useState } from "react";

export type Facing = "environment" | "user";

export interface Camera {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: "off" | "starting" | "live" | "error";
  error: string | null;
  facing: Facing;
  /** More than one camera (e.g. a phone's front and back camera). */
  canSwitch: boolean;
  switchCamera: () => void;
}

function cameraError(e: unknown): string {
  const name = e instanceof DOMException ? e.name : "";
  if (name === "NotAllowedError") return "Camera permission was denied. Allow the camera for this site in the browser settings, then reload.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No camera was found on this device.";
  if (name === "NotReadableError") return "The camera is in use by another app.";
  return e instanceof Error ? `Camera unavailable: ${e.message}` : "Camera unavailable";
}

/** Browsers only expose the camera on HTTPS pages and on localhost. */
export function cameraSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

/** Stream the device camera into `videoRef` while `enabled` is true. Prefers the back camera. */
export function useCamera(enabled: boolean): Camera {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [facing, setFacing] = useState<Facing>("environment");
  const [status, setStatus] = useState<Camera["status"]>("off");
  const [error, setError] = useState<string | null>(null);
  const [canSwitch, setCanSwitch] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setStatus("off");
      return;
    }
    if (!cameraSupported()) {
      setStatus("error");
      setError(
        window.isSecureContext
          ? "This browser cannot use the camera."
          : "Live camera needs HTTPS when the site is opened from another device. Use “Open phone camera” below, or start the site with npm run dev:mobile."
      );
      return;
    }
    let stream: MediaStream | null = null;
    let cancelled = false;
    setStatus("starting");
    setError(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then(async (s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const video = videoRef.current;
        if (video) {
          video.srcObject = s;
          await video.play().catch(() => undefined);
        }
        setStatus("live");
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCanSwitch(devices.filter((d) => d.kind === "videoinput").length > 1);
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus("error");
        setError(cameraError(e));
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [enabled, facing]);

  return {
    videoRef,
    status,
    error,
    facing,
    canSwitch,
    switchCamera: () => setFacing((f) => (f === "environment" ? "user" : "environment")),
  };
}

function toJpeg(source: CanvasImageSource, width: number, height: number, maxSide: number): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not capture the image"))), "image/jpeg", 0.85)
  );
}

/** The current video frame as a JPEG, at most `maxSide` pixels wide or tall. */
export function grabFrame(video: HTMLVideoElement, maxSide = 1024): Promise<Blob> {
  return toJpeg(video, video.videoWidth, video.videoHeight, maxSide);
}

/** Shrink a photo before upload (phone photos are often 3–8 MB; the model looks at 224 px).
 * Formats the browser cannot decode, such as HEIC in Chrome, are sent as they are. */
export async function shrinkImage(file: File, maxSide = 1280): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const blob = await toJpeg(bitmap, bitmap.width, bitmap.height, maxSide);
    bitmap.close();
    return blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}
