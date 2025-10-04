export default function AppButton({ children, onClick, type="button", variant="primary", disabled }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn ${variant} ${disabled?"btn-disabled":""}`}>
      {children}
    </button>
  );
} // Generalno dugme koje se koristi u aplikaciji