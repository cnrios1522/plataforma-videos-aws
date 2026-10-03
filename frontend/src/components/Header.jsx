import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="header">

      <Link to="/" className="logo">
        ▶ VideoHub
      </Link>

      <div className="header-actions">

        <Link to="/">
          Inicio
        </Link>

        <Link to="/profile">
          Perfil
        </Link>

        <button onClick={logout}>
          Cerrar sesión
        </button>

      </div>

    </header>
  );
}

export default Header;