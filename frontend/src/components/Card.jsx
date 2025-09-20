export default function Card({ title, children, header }) {
  return (
    <div className="card">
      {header}
      {title && <h2 className="card-title">{title}</h2>}
      {children}
    </div>
  );
}