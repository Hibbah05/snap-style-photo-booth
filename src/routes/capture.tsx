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
    const ctx = c.getContext("2d")!;
    // mirror
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    const sx = (v.videoWidth - size) / 2;
    const sy = (v.videoHeight - size) / 2;
    ctx.drawImage(v, sx, sy, size, size, 0, 0, size, size);
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

      <div className="relative">
        <div className="absolute -top-4 -left-4 -right-4 text-center z-20 pointer-events-none">
          {count !== null && (
            <span className="inline-block text-8xl font-serif text-foreground drop-shadow-md">
              {count}
            </span>
          )}
        </div>
        <div className="relative w-[min(80vw,520px)] aspect-square bg-muted border border-border overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
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
