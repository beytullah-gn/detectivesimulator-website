import { AlertCircleIcon } from "./icons";

export default function AlertMessage({ message }) {
  if (!message) return null;
  return (
    <div className="alert" role="alert">
      <AlertCircleIcon size={18} className="alert-icon" />
      <span>{message}</span>
    </div>
  );
}
