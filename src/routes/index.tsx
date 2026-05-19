import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Photo Booth — Minimal" },
      { name: "description", content: "A minimal photo booth. Take or upload three photos, decorate, download." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-background animate-fade-in">
      <div className="text-center max-w-xl">
        <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground mb-6">est. 2026</p>
        <h1 className="text-7xl md:text-8xl font-serif text-foreground leading-none">
          photo<span className="italic"> booth</span>
        </h1>
        <div className="h-px w-24 bg-foreground/30 mx-auto my-8" />
        <p className="text-base text-muted-foreground font-serif italic">
          Three frames. One little memory.
        </p>
        <div className="mt-12">
          <Link
            to="/menu"
            className="inline-block px-10 py-3 border border-foreground text-foreground text-sm tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            Begin
          </Link>
        </div>
      </div>
      <footer className="absolute bottom-6 text-xs text-muted-foreground tracking-widest uppercase">
        a quiet little booth
      </footer>
    </main>
  );
}
