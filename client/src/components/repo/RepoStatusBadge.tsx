type StatusStyle = { bg: string; text: string; dot: string };

const STATUS_STYLES: Record<string, StatusStyle> = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-400' },
  cloning: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-400' },
  ready: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-400' },
  parsing: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-400' },
  parsed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400' },
  error: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-400' },
};

const FALLBACK: StatusStyle = { bg: 'bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400' };

export default function RepoStatusBadge({ status }: { status: string }) {
  const style: StatusStyle = STATUS_STYLES[status] ?? FALLBACK;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
