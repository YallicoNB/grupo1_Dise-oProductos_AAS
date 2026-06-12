import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import api from "../services/api";
import { Cliente, UsuarioAdmin } from "../types/_index";

interface AuthContextType {
  token: string | null;
  userRole: "admin" | "client" | null;
  cliente: Cliente | null;
  usuarioAdmin: UsuarioAdmin | null;
  isAuthenticated: boolean;
  login: (
    endpoint: string,
    credentials: Record<string, string>,
  ) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [userRole, setUserRole] = useState<"admin" | "client" | null>(
    localStorage.getItem("userRole") as "admin" | "client" | null,
  );
  const [cliente, setCliente] = useState<Cliente | null>(() => {
    const saved = localStorage.getItem("clienteData");
    return saved ? JSON.parse(saved) : null;
  });
  const [usuarioAdmin, setUsuarioAdmin] = useState<UsuarioAdmin | null>(() => {
    const saved = localStorage.getItem("adminData");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(
    async (endpoint: string, credentials: Record<string, string>) => {
      const response = await api.post(endpoint, credentials);
      const data = response.data;

      localStorage.setItem("token", data.token);
      const role = data.usuarioAdmin ? "admin" : "client";
      localStorage.setItem("userRole", role);
      setToken(data.token);
      setUserRole(role);
      if (data.usuarioAdmin) {
        setUserRole("admin");
        setUsuarioAdmin(data.usuarioAdmin);
      } else if (data.cliente) {
        localStorage.setItem("clienteData", JSON.stringify(data.cliente));
        setCliente(data.cliente);
      }
    },
    [],
  );

  const register = useCallback(async (data: Record<string, string>) => {
    const response = await api.post("/client/register", data);
    const responseData = response.data;

    localStorage.setItem("token", responseData.token);
    localStorage.setItem("userRole", "client");
    setToken(responseData.token);
    setUserRole("client");
    setCliente(responseData.cliente);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.clear(); // Limpia todo
    setToken(null);
    setUserRole(null);
    setCliente(null);
    setUsuarioAdmin(null);
  }, []);

  const value: AuthContextType = {
    token,
    userRole,
    cliente,
    usuarioAdmin,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
