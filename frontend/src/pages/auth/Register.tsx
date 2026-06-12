import React, { useState } from "react";
import { Cliente } from "../../types/_index";
import api from "../../services/api";

const Register: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValidPhone = (val: string) => /^(\+51)?9\d{8}$/.test(val);

  const validarFormulario = (): boolean => {
    setError("");
    setSuccess("");

    if (!nombre || !apellido) {
      setError("Por favor ingresa tu nombre y apellido.");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("Ingresa un correo electrónico válido.");
      return false;
    }
    if (telefono && !isValidPhone(telefono)) {
      setError("Ingresa un número de teléfono válido.");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return false;
    }
    if (!terms) {
      setError("Debes aceptar los términos de servicio.");
      return false;
    }
    return true;
    /* voy a tener esto asi soy experimenteo @Patitas 
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("¡Cuenta creada con éxito! Redirigiendo...");
    }, 1800);
  };/*/
  };

  const mandarDatos = async () => {
    const validar = validarFormulario();
    if (validar === false) return;

    setLoading(true); // 1. Iniciamos la carga
    setError(""); // Limpiamos errores previos

    try {
      // 2. Corregimos el Template Literal con backticks ``
      const datosEmviar = {
        nombreCompleto: `${nombre} ${apellido}`, // Corregido: espacios y llaves
        correoElectronico: email,
        telefono: telefono,
        contrasena: password, // Asegúrate que tu DTO en Java se llame exactamente "contrasena"
      };

      console.log("Enviando datos:", datosEmviar);

      // 3. Enviamos al endpoint correcto
      const respuesta = await api.post("/client/register", datosEmviar);

      setLoading(false);
      setSuccess("¡Cuenta creada con éxito! Redirigiendo...");
      console.log("Respuesta del servidor:", respuesta.data);
    } catch (err: any) {
      setLoading(false);
      console.error("Error en el registro:", err);

      // Si el backend envía un mensaje de error (como el de "correo ya registrado")
      const mensajeError =
        err.response?.data?.error || "Error al conectar con el servidor";
      setError(mensajeError);
    }
  };

  return (
    <div
      className="register-page"
      style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}
    >
      <div className="left-panel">
        <div className="overlay"></div>
        <div className="brand-info">
          <h2>Antonela Art</h2>
          <p>
            Embárquese en una experiencia de belleza excepcional. Cada detalle
            ha sido diseñado para su máximo confort y estilo.
          </p>
          <div className="dots">
            <span className="active"></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="register-box">
          <p className="eyebrow">BIENVENIDA AL ATELIER</p>
          <h1>Crea tu cuenta</h1>
          <p className="subtitle">
            Comience su viaje hacia una belleza renovada hoy mismo.
          </p>

          {error && (
            <div className="error-msg" style={{ display: "block" }}>
              {error}
            </div>
          )}
          {success && (
            <div className="success-msg" style={{ display: "block" }}>
              {success}
            </div>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                placeholder="Ej. Ana"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                placeholder="Ej. García"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              placeholder="ana.garcia@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              placeholder="+51 000 000 000"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <input
                  type={pwdVisible ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="input-icon"
                  onClick={() => setPwdVisible(!pwdVisible)}
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    {pwdVisible ? (
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
            <div className="form-group">
              <label>Confirmar</label>
              <div className="input-wrapper">
                <input
                  type={confirmVisible ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <span
                  className="input-icon"
                  onClick={() => setConfirmVisible(!confirmVisible)}
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    {confirmVisible ? (
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
          </div>

          <div className="terms-row">
            <input
              type="checkbox"
              id="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
            <label className="checkbox-label" htmlFor="terms">
              <span className="custom-checkbox"></span>
              Acepto los términos de servicio y la política de privacidad.
            </label>
          </div>

          <button
            className={`btn-register${loading ? " loading" : ""}`}
            onClick={mandarDatos}
            disabled={loading}
          >
            <span className="spinner"></span>
            <span className="btn-text">CREAR CUENTA</span>
          </button>

          <div className="login-row">
            ¿Ya tengo una cuenta? <a href="/login">Iniciar sesión</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
