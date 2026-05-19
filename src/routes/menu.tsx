import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Choose — Photo Booth" },
      { name: "description", content: "Take photos with your camera or upload three of your own." },
    ],
  }),
  component: Menu,
});

function Menu() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <Link to="/" className="absolute top-6 left-6 text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground">
        ← back
      </Link>
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground mb-3">step one</p>
        <h2 className="text-5xl md:text-6xl font-serif">how shall we begin?</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link
          to="/capture"
          className="group relative bg-card border border-border p-10 text-center hover:border-foreground transition-colors"
        >
          <span className="washi-tape -top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]" />
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">option a</p>
          <h3 className="text-3xl font-serif mb-2">Take photos</h3>
          <p className="text-sm text-muted-foreground font-serif italic">with a 3·2·1 timer</p>
        </Link>
        <Link
          to="/upload"
          className="group relative bg-card border border-border p-10 text-center hover:border-foreground transition-colors"
        >
          <span className="washi-tape -top-3 left-1/2 -translate-x-1/2 rotate-[5deg]" />
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">option b</p>
          <h3 className="text-3xl font-serif mb-2">Upload photos</h3>
          <p className="text-sm text-muted-foreground font-serif italic">choose three from your library</p>
        </Link>
      </div>
    </main>
  );
}
