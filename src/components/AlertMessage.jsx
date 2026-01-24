export default function AlertMessage({ message }) {
  if (!message) return null;
  return <div className="alert">{message}</div>;
}
