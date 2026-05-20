import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { setBoothPhotos } from "@/lib/photo-store";

export const Route = createFileRoute("/capture")({
  head: () => ({
    meta: [{ title: "Capture — Photo Booth" }],
  }),
  component: Capture,
});

function Capture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [shot, setShot] = useState(0); // 0..3 taken
  const [shots, setShots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 1. The Global Filter State
  const [activeFilter, setActiveFilter] = useState<"normal" | "bw" | "vintage">("normal");

  // 2. Tailwind Classes for Live Video Preview
  const filterStyles = {
    normal: "",
    bw: "grayscale",
    vintage: "sepia contrast-125 brightness-90",
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 720, height: 720 }, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setReady(true);
        }
      })
      .catch(() => setError("Camera access denied. Please allow access or upload photos instead."));
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const snap = (): string => {
    const v = videoRef.current!;
    const c = canvasRef.current!;
    const size = Math.min(v.videoWidth, v.videoHeight);
    c.width = size;
    c.height = size;
    // willReadFrequently optimizes the canvas for direct pixel manipulation
    const ctx = c.getContext("2d", { willReadFrequently: true })!;

    // mirror the image
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    const sx = (v.videoWidth - size) / 2;
    const sy = (v.videoHeight - size) / 2;
    ctx.drawImage(v, sx, sy, size, size, 0, 0, size, size);

    // Reset transform so our pixel math applies cleanly
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 📸 Mobile-Safe Pixel Baking
    if (activeFilter !== "normal") {
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (activeFilter === "bw") {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = data[i + 1] = data[i + 2] = gray;
        } else if (activeFilter === "vintage") {
          // Sepia color math
          const tr = 0.393 * r + 0.769 * g + 0.189 * b;
          const tg = 0.349 * r + 0.686 * g + 0.168 * b;
          const tb = 0.272 * r + 0.534 * g + 0.131 * b;
          // Contrast and Brightness adjustments
          data[i] = Math.min(255, (tr - 128) * 1.2 + 115);
          data[i + 1] = Math.min(255, (tg - 128) * 1.2 + 115);
          data[i + 2] = Math.min(255, (tb - 128) * 1.2 + 115);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    return c.toDataURL("image/jpeg", 0.92);
  };

  const runSession = async () => {
    const collected: string[] = [];
    for (let i = 0; i < 3; i++) {
      setShot(i);
      for (let n = 3; n >= 1; n--) {
        setCount(n);
        await new Promise((r) => setTimeout(r, 1000));
      }
      setCount(null);
      const data = snap();
      collected.push(data);
      setShots([...collected]);
      await new Promise((r) => setTimeout(r, 600));
    }
    setBoothPhotos(collected);
    navigate({ to: "/final" });
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 flex flex-col items-center animate-fade-in">
      <Link to="/menu" className="absolute top-6 left-6 text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground">
        ← back
      </Link>
      
      <div className="text-center mb-6">
        <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground mb-2">
          {shots.length < 3 ? `frame ${shot + 1} of 3` : "complete"}
        </p>
        <h2 className="text-4xl md:text-5xl font-serif">say cheese</h2>
      </div>

      {error && (
        <div className="border border-border bg-card p-6 max-w-md text-center">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Link to="/upload" className="text-sm underline">Upload instead →</Link>
        </div>
      )}

      {/* 4. The Interactive Filter Menu */}
      {!error && shots.length === 0 && (
        <div className="flex gap-4 justify-center mb-6">
          <button 
            onClick={() => setActiveFilter("normal")}
            className={`px-4 py-2 rounded-full text-xs tracking-widest uppercase transition-colors ${activeFilter === "normal" ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-muted/80"}`}
          >
            Normal
          </button>
          <button 
            onClick={() => setActiveFilter("bw")}
            className={`px-4 py-2 rounded-full text-xs tracking-widest uppercase transition-colors ${activeFilter === "bw" ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-muted/80"}`}
          >
            B&W
          </button>
          <button 
            onClick={() => setActiveFilter("vintage")}
            className={`px-4 py-2 rounded-full text-xs tracking-widest uppercase transition-colors ${activeFilter === "vintage" ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-muted/80"}`}
          >
            Vintage
          </button>
        </div>
      )}

      <div className="relative">
        <div className="absolute -top-4 -left-4 -right-4 text-center z-20 pointer-events-none">
          {count !== null && (
            <span className="inline-block text-8xl font-serif text-foreground drop-shadow-md">
              {count}
            </span>
          )}
        </div>
        <div className="relative w-[min(80vw,520px)] aspect-square bg-muted border border-border overflow-hidden">
          {/* 5. Apply the Tailwind CSS to the live feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-all duration-300 ${filterStyles[activeFilter]}`}
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-6 flex gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-16 h-16 border border-border bg-card overflow-hidden">
            {shots[i] && <img src={shots[i]} alt="" className="w-full h-full object-cover" />}
          </div>
        ))}
      </div>

      <button
        onClick={runSession}
        disabled={!ready || shots.length > 0 || !!error}
        className="mt-8 px-10 py-3 border border-foreground text-foreground text-sm tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {shots.length === 0 ? "Start" : "Capturing…"}
      </button>
    </main>
  );
}