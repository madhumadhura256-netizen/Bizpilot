import { useEffect, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const formats = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.QR_CODE,
];

export default function Scanner({ onScan, onClose }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader", {
      formatsToSupport: formats,
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      verbose: false,
    });
    let last = 0;

    const starting = scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (w, h) => ({ width: Math.floor(w * 0.85), height: Math.floor(h * 0.5) }),
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        (text) => {
          const now = Date.now();
          if (now - last < 2000) return;
          last = now;
          onScan(text);
        },
        () => {}
      )
      .catch((err) => {
        const msg = String(err);
        if (msg.includes("NotAllowed") || msg.includes("Permission"))
          setError("Camera permission denied. You can still upload an image below.");
        else if (msg.includes("NotFound"))
          setError("No camera found. You can still upload an image below.");
        else if (!window.isSecureContext) setError("Camera needs HTTPS. Use the Vercel link or localhost.");
        else setError("Could not start camera. You can still upload an image below.");
      });

    return () => {
      starting.then(() => scanner.stop().then(() => scanner.clear()).catch(() => {}));
    };
  }, []);

  // Decode a still image (uploaded file, photo, or captured frame)
  const decodeFile = async (file) => {
    setError("");
    setBusy(true);
    const fileScanner = new Html5Qrcode("file-reader", {
      formatsToSupport: formats,
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      verbose: false,
    });
    try {
      const text = await fileScanner.scanFile(file, false);
      onScan(text);
    } catch {
      setError("No barcode found in this image. Use a clear, high-contrast barcode image.");
    }
    try { fileScanner.clear(); } catch {}
    setBusy(false);
  };

  const captureFrame = () => {
    const video = document.querySelector("#reader video");
    if (!video || !video.videoWidth) {
      setError("Camera is not ready yet.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) decodeFile(new File([blob], "frame.png", { type: "image/png" }));
    }, "image/png");
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) decodeFile(file);
    e.target.value = "";
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4 max-w-md">
      <div id="reader" />
      <div id="file-reader" style={{ display: "none" }} />

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={captureFrame} disabled={busy} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
          {busy ? "Reading..." : "Capture & scan"}
        </button>

        <label className="cursor-pointer rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white">
          Take photo
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        </label>

        <label className="cursor-pointer rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white">
          Upload image
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <p className="text-xs text-slate-500 mt-2">Hold the barcode flat, 15-20 cm away, in good light.</p>
      <button type="button" onClick={onClose} className="mt-2 text-red-600">Close camera</button>
    </div>
  );
}