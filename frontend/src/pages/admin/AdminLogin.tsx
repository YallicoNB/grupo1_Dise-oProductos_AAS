import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, userRole } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && userRole === "admin") {
      navigate("/admin");
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login("/admin/login", {
        nombreUsuario: username,
        contrasena: password,
      });
      navigate("/admin");
    } catch (err: any) {
      setError(err.response?.data?.error || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  const pageStyle: React.CSSProperties = {
    display: "flex",
    minHeight: "100vh",
    background: "var(--cream)",
  };

  return (
    <div style={pageStyle}>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: "var(--white)",
            borderRadius: 20,
            padding: "48px 40px",
            boxShadow: "0 8px 40px rgba(120,80,20,0.1)",
            border: "1px solid rgba(184,150,46,0.15)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <i
              className="bi bi-gem"
              style={{ fontSize: 40, color: "var(--gold)" }}
            />
            <h1
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 32,
                fontWeight: 400,
                color: "var(--dark)",
                marginTop: 12,
                marginBottom: 4,
              }}
            >
              Administración
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "var(--muted)",
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Acceso privado para el staff de Antonela Art
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(200,60,60,0.08)",
                border: "1px solid rgba(200,60,60,0.2)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#b03030",
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="antonela_admin"
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold"
              style={{ width: "100%", padding: "14px 28px", fontSize: 13 }}
            >
              {loading ? "Ingresando..." : "Ingresar al Panel"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <a
              href="/"
              style={{
                fontSize: 13,
                color: "var(--muted)",
                textDecoration: "none",
              }}
            >
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
