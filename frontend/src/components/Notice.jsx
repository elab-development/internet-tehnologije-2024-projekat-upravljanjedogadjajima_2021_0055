export default function Notice({ kind="info", children }) {
  return <div className={`notice ${kind}`}>{children}</div>;
}