import { useState } from "react";

export default function TextField({ label, type="text", name, value, onChange, placeholder, error, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div className="field">
      {label && <label htmlFor={name} className="field-label">{label}</label>}
      <div className="field-input-wrap">
        <input
          id={name}
          name={name}
          type={inputType}
          className={`field-input ${error ? "has-error" : ""}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        {isPassword && (
          <button type="button" className="reveal" onClick={() => setShow(s => !s)}>
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}