export function Loading({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-text-tertiary">
      <div className="flex items-center gap-2.5">
        <div className="w-4 h-4 border-2 border-accent-soft border-t-accent rounded-full animate-spin" />
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-48 bg-border-soft rounded-[6px]" />
      <div className="h-4 w-32 bg-border-soft rounded-[6px]" />
      <div className="h-32 bg-border-soft rounded-[10px]" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-border-soft rounded-[10px]" />
        ))}
      </div>
    </div>
  );
}
