import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { getBoothPhotos } from "@/lib/photo-store";

export const Route = createFileRoute("/final")({
  head: () => ({
    meta: [{ title: "Decorate & Download — Photo Booth" }],
  }),
  component: Final,
});

type Sticker = { id: number; emoji: string; x: number; y: number };

const STICKERS = ["♡", "✿", "★", "✺", "❀", "✦"];

function Final() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const p = getBoothPhotos();
    if (p.length < 3) {
      navigate({ to: "/menu" });
      return;
    }
    setPhotos(p);
  }, [navigate]);

  const addSticker = (emoji: string) => {
    setStickers((s) => [
      ...s,
      { id: Date.now() + Math.random(), emoji, x: 50 + Math.random() * 60, y: 50 + Math.random() * 400 },
    ]);
  };

  const onPointerDown = (id: number, e: React.PointerEvent) => {
    setDragId(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragId === null || !stripRef.current) return;
    const rect = stripRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStickers((arr) => arr.map((s) => (s.id === dragId ? { ...s, x, y } : s)));
  };
  const onPointerUp = () => setDragId(null);

  const download = async () => {
    if (!stripRef.current) return;
    const dataUrl = await toPng(stripRef.current, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "photobooth.png";
    a.click();
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 flex flex-col items-center">
      <Link to="/menu" className="absolute top-6 left-6 text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground">
        ← back
      </Link>
      <div className="text-center mb-6">
        <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground mb-2">last step</p>
        <h2 className="text-4xl md:text-5xl font-serif">decorate &amp; download</h2>
        <p className="text-sm text-muted-foreground font-serif italic mt-2">tap a sticker, then drag to place</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {STICKERS.map((e) => (
          <button
            key={e}
            onClick={() => addSticker(e)}
            className="w-12 h-12 border border-border bg-card text-2xl hover:border-foreground transition-colors"
          >
            {e}
          </button>
        ))}
        <button
          onClick={() => setStickers([])}
          className="px-4 h-12 border border-border bg-card text-xs tracking-[0.25em] uppercase hover:border-foreground"
        >
          reset
        </button>
      </div>

      <div
        ref={stripRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative bg-paper p-5 pb-12 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] select-none touch-none"
        style={{ width: 280 }}
      >
        <span className="washi-tape -top-3 left-1/2 -translate-x-1/2 rotate-[-3deg]" />
        <p className="text-center text-xs tracking-[0.35em] uppercase text-foreground/70 mb-3 mt-1">
          photo · booth
        </p>
        <div className="flex flex-col gap-3">
          {photos.map((src, i) => (
            <div key={i} className="aspect-square bg-muted overflow-hidden border border-border/50">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] tracking-[0.3em] uppercase text-foreground/50 mt-3 font-serif italic">
          a little memory
        </p>
        {stickers.map((s) => (
          <span
            key={s.id}
            onPointerDown={(e) => onPointerDown(s.id, e)}
            className="absolute text-3xl cursor-grab active:cursor-grabbing"
            style={{ left: s.x, top: s.y, transform: "translate(-50%, -50%)", color: "oklch(0.55 0.15 20)" }}
          >
            {s.emoji}
          </span>
        ))}
      </div>

      <div className="mt-10 flex gap-4">
        <button
          onClick={download}
          className="px-10 py-3 bg-foreground text-background text-sm tracking-[0.25em] uppercase hover:bg-foreground/90 transition-colors"
        >
          Download
        </button>
        <Link
          to="/"
          className="px-10 py-3 border border-foreground text-foreground text-sm tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition-colors"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
