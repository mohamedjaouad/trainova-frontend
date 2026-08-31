import axios from "axios"
import type { AxiosInstance } from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export const authService = {
  register: (userData: RegisterData) =>
    apiClient.post("/auth/register", userData),

  login: (credentials: LoginData) => apiClient.post("/auth/login", credentials),

  getMe: () => apiClient.get("/users/me"),
}
export const adminService = {
  getUsers: () => apiClient.get("/api/admin/users"),
  updateUser: (
    id: string,
    data: { fullName?: string; email?: string; isAdmin?: boolean },
  ) => apiClient.put(`/api/admin/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/api/admin/users/${id}`),
}

export default apiClient
