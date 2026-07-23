// Skeleton exibido durante a navegação entre as páginas do aluno.
export default function AlunoLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-md bg-muted" />
        <div className="h-4 w-52 rounded bg-muted" />
      </div>
      <div className="h-24 rounded-xl border bg-muted/50" />
      <div className="h-40 rounded-xl border bg-muted/50" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-20 rounded-lg border bg-muted/50" />
        <div className="h-20 rounded-lg border bg-muted/50" />
      </div>
    </div>
  );
}
