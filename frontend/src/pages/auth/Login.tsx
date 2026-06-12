import React, { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { login } = useAuth(); // <-- Consumimos el método de tu contexto
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleLogin = (): boolean => {
    setError("");
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("Ingresa un correo electrónico válido.");
      return false;
    }

    return true;
    //* esto lo dejamos asi porque no aporta en nada por ahora
    /* 
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError('Correo o contraseña incorrectos. Inténtalo de nuevo.');
    }, 1800);*/
  };

  const Login = async () => {
    const valido = handleLogin();
    if (valido === false) return;

    const datos_emviar = {
      correoElectronico: email,
      contrasena: password,
    };

    try {
      setLoading(true);
      setError("");
      console.log("comprobando datos del server");

      await login("/client/login", datos_emviar);

      navigate("/client/panel");
    } catch (error: any) {
      console.log("datos no comprovados");
      console.error(error);
      setError("Correo o contraseña incorrectos. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      className="login-page"
      style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}
    >
      {/* LEFT: Brand Panel */}
      <div className="left-panel">
        <div className="brand-card">
          <div className="brand-logo">
            ANTONELA <span>ART</span>
          </div>
          <div className="brand-tagline">Atelier de Belleza Exclusivo</div>
          <div className="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <ul className="features">
            <li>Reserva de citas online</li>
            <li>Gestión de empleados</li>
            <li>Control de inventario</li>
            <li>Panel de reportes</li>
          </ul>
        </div>
      </div>

      {/* RIGHT: Login Panel */}
      <div className="right-panel">
        <div className="login-box">
          <h1>Bienvenido</h1>
          <p className="login-subtitle">
            Ingresa tus credenciales para acceder a tu espacio artístico.
          </p>

          {error && (
            <div className="error-msg" style={{ display: "block" }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Correo Electrónico</label>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className="input-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span
                className="input-icon"
                onClick={() => setPasswordVisible(!passwordVisible)}
                style={{ cursor: "pointer" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  {passwordVisible ? (
                    <>
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 7 11 7a9.74 9.74 0 0 0 5.39-1.61" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </span>
            </div>
          </div>

          <div className="form-row">
            <input type="checkbox" id="remember" />
            <label className="checkbox-label" htmlFor="remember">
              <span className="custom-checkbox"></span>
              Recordarme
            </label>
            <a href="/forgot-password" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            className={`btn-login${loading ? " loading" : ""}`}
            onClick={Login}
            disabled={loading}
          >
            <span className="spinner"></span>
            <span className="btn-text">
              INICIAR SESIÓN
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                style={{ marginLeft: 8 }}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </button>

          <div className="divider">
            <span>Recuerda</span>
          </div>

          <div className="register-row">
            ¿No tienes una cuenta? <a href="/register">Regístrate gratis</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
