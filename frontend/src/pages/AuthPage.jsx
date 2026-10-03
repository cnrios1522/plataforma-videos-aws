import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../api";

function AuthPage() {
  const navigate = useNavigate();

  const [registerMode, setRegisterMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (response.ok) {
      alert("Usuario registrado correctamente");
      setRegisterMode(false);
    } else {
      const error = await response.json();
      alert(error.detail);
    }
  };

  const login = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.ok) {
      const user = await response.json();

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      navigate("/");
      window.location.reload();
    } else {
      alert("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-left">

        <div>
          <h1>▶ VideoHub</h1>

          <h2>
            Comparte tus videos
            <br />
            con el mundo
          </h2>

          <p>
            Publica, descubre y reproduce videos.
          </p>
        </div>

      </div>

      <div className="auth-right">

        <div className="auth-card">

          <div className="auth-tabs">

            <button
              className={!registerMode ? "active" : ""}
              onClick={() => setRegisterMode(false)}
            >
              Iniciar sesión
            </button>

            <button
              className={registerMode ? "active" : ""}
              onClick={() => setRegisterMode(true)}
            >
              Registrarse
            </button>

          </div>

          <form
            onSubmit={
              registerMode
                ? register
                : login
            }
          >

            {registerMode && (
              <>
                <label>Nombre</label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </>
            )}

            <label>Correo</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <label>Contraseña</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              type="submit"
              className="primary-button"
            >
              {registerMode
                ? "Crear cuenta"
                : "Iniciar sesión"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AuthPage;