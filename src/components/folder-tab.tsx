const statusColors: Record<string, string> = {
  borrador: "bg-stone-400",
  enviado: "bg-blue-400",
  aprobado: "bg-accent",
  pagado: "bg-success",
  vencido: "bg-destructive",
};

interface Props {
  status: string;
  label?: string;
  className?: string;
}

export function FolderTab({ status, label, className = "" }: Props) {
  const color = statusColors[status] || "bg-stone-400";
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`w-1 h-5 rounded-r-full ${color} flex-shrink-0`} />
      <span className="text-xs font-medium text-text-tertiary ml-1.5 leading-tight">
        {label || status}
      </span>
    </div>
  );
}
