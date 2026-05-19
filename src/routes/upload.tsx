import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setBoothPhotos } from "@/lib/photo-store";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [{ title: "Upload — Photo Booth" }],
  }),
  component: Upload,
});

function readFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function Upload() {
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const navigate = useNavigate();

  const onPick = async (i: number, file: File | null) => {
    if (!file) return;
    const data = await readFile(file);
    const next = [...photos];
    next[i] = data;
    setPhotos(next);
  };

  const allReady = photos.every(Boolean);

  const proceed = () => {
    setBoothPhotos(photos.filter(Boolean) as string[]);
    navigate({ to: "/final" });
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 flex flex-col items-center">
      <Link to="/menu" className="absolute top-6 left-6 text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground">
        ← back
      </Link>
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground mb-2">upload</p>
        <h2 className="text-4xl md:text-5xl font-serif">choose three photos</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
        {photos.map((p, i) => (
          <label
            key={i}
            className="relative aspect-square bg-card border border-border flex items-center justify-center cursor-pointer hover:border-foreground transition-colors overflow-hidden"
          >
            {p ? (
              <img src={p} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <p className="text-3xl font-serif text-muted-foreground">+</p>
                <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mt-2">frame {i + 1}</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPick(i, e.target.files?.[0] ?? null)}
            />
          </label>
        ))}
      </div>

      <button
        onClick={proceed}
        disabled={!allReady}
        className="mt-10 px-10 py-3 border border-foreground text-foreground text-sm tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </main>
  );
}
