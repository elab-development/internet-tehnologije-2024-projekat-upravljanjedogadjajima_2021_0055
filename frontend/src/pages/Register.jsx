import Card from "../components/Card";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="page auth-grid">
      <Card title="Registracija">
        <p>Register forma (dodaćemo kasnije).</p>
        <Link className="link" to="/login">Već imaš nalog? Uloguj se.</Link>
      </Card>
    </div>
  );
}