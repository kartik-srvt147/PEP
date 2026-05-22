import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const toastStyles = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    iconClassName: 'text-emerald-600',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-800',
    iconClassName: 'text-red-600',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800',
    iconClassName: 'text-blue-600',
  },
};

const ToastStack = ({ toasts, onDismiss }) => {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-20 z-[70] w-[calc(100vw-2rem)] max-w-sm space-y-3">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type] || toastStyles.info;
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg shadow-slate-900/10 ${style.className}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClassName}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.message && <p className="mt-1 text-sm opacity-90">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-md p-1 opacity-70 transition hover:bg-white/70 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastStack;
