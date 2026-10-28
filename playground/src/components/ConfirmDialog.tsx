type Props = {
  title: string;
  message: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ title, message, open, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="dialog">
      <h2 id="confirm-title">{title}</h2>
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
