export function Footer() {
  return (
    <footer className="border-t border-primary/60 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-foreground/70">
        <p className="font-display text-lg font-semibold text-accent">Florie</p>
        <p className="mt-1">Mỗi bó hoa, một câu chuyện.</p>
        <p className="mt-4 text-xs text-foreground/50">
          © {new Date().getFullYear()} Florie. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
