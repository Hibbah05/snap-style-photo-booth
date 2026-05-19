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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onPickSingle = async (i: number, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose image files only.");
      return;
    }
    setError(null);
    const data = await readFile(file);
    setPhotos((prev) => {
      const next = [...prev];
      next[i] = data;
      return next;
    });
  };

  const onPickMany = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 3);
    if (imgs.length === 0) {
      setError("Please choose image files only.");
      return;
    }
    setError(null);
    const datas = await Promise.all(imgs.map(readFile));
    const next: (string | null)[] = [null, null, null];
    datas.forEach((d, idx) => (next[idx] = d));
    setPhotos(next);
  };

  const removeAt = (i: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
  };

  const filledCount = photos.filter(Boolean).length;
  const allReady = filledCount === 3;

  const proceed = () => {
    if (!allReady) return;
    setBoothPhotos(photos.filter(Boolean) as string[]);
    navigate({ to: "/final" });
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 flex flex-col items-center animate-fade-in">
      <Link
        to="/menu"
        className="absolute top-6 left-6 text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground"
      >
        ← back
      </Link>

      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground mb-2">upload</p>
        <h2 className="text-4xl md:text-5xl font-serif">choose three photos</h2>
        <p className="text-sm text-muted-foreground font-serif italic mt-3">
          {filledCount} of 3 selected
        </p>
      </div>

      <label className="mb-8 px-6 py-2 border border-border bg-card text-xs tracking-[0.25em] uppercase cursor-pointer hover:border-foreground hover:-translate-y-0.5 transition-all">
        pick all at once
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onPickMany(e.target.files)}
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
        {photos.map((p, i) => (
          <div
            key={i}
            className="relative animate-scale-in"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
          >
            <label className="relative block aspect-square bg-card border border-border cursor-pointer hover:border-foreground transition-colors overflow-hidden group">
              {p ? (
                <img
                  src={p}
                  alt={`frame ${i + 1}`}
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-serif text-muted-foreground group-hover:text-foreground transition-colors">+</p>
                  <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mt-2">
                    frame {i + 1}
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickSingle(i, e.target.files?.[0] ?? null)}
              />
            </label>
            {p && (
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-2 right-2 w-7 h-7 bg-background/90 border border-border text-xs hover:bg-foreground hover:text-background transition-colors"
                aria-label={`Remove frame ${i + 1}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-sm text-destructive animate-fade-in">{error}</p>
      )}

      <button
        onClick={proceed}
        disabled={!allReady}
        className="mt-10 px-10 py-3 border border-foreground text-foreground text-sm tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </main>
  );
}
