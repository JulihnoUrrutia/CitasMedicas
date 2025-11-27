const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        console.log('🔧 ApiService configurado con URL:', this.baseURL);
    }

    // =============================
    // 📌 HEADERS
    // =============================
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    // =============================
    // 📌 MANEJO DE RESPUESTAS
    // =============================
    async handleResponse(response) {
        console.log(`📥 Response ${response.status}: ${response.url}`);
        if (!response.ok) {
            let message = `Error ${response.status}`;
            try {
                const err = await response.json();
                message = err.message || message;
            }
            catch {
                const text = await response.text();
                message = text || message;
            }
            throw new Error(message);
        }
        return await response.json();
    }

    // =============================
    // 📌 AUTH
    // =============================
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(userData),
            });
            const result = await this.handleResponse(response);
            if (result.success && result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
            }
            return result;
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }

    async login(credentials) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(credentials),
            });
            const result = await this.handleResponse(response);
            if (result.success && result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
            }
            return result;
        }
        catch (error) {
            return { success: false, message: error.message || 'Credenciales incorrectas' };
        }
    }

    async verifyToken() {
        try {
            const response = await fetch(`${this.baseURL}/auth/verify`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch {
            this.logout();
            return { success: false, message: 'Token inválido' };
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { success: true };
    }

    // =============================
    // 📌 USUARIOS (ADMIN)
    // =============================
    async getUsuarios() {
        try {
            console.log("👥 Obteniendo todos los usuarios...");
            const response = await fetch(`${this.baseURL}/usuarios`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            console.error("❌ Error obteniendo usuarios:", error);
            return { success: false, data: [] };
        }
    }

    async updateUsuario(id, userData) {
        try {
            const response = await fetch(`${this.baseURL}/usuarios/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(userData),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }

    async deleteUsuario(id) {
        try {
            const response = await fetch(`${this.baseURL}/usuarios/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =============================
    // 📌 CITAS ADMIN
    // =============================
    async getCitasAdmin(filtros = {}) {
        try {
            console.log("📋 Obteniendo citas para admin...", filtros);
            const queryParams = new URLSearchParams();
            if (filtros.fecha)
                queryParams.append('fecha', filtros.fecha);
            if (filtros.estado)
                queryParams.append('estado', filtros.estado);
            if (filtros.usuarioId)
                queryParams.append('usuarioId', filtros.usuarioId);
            if (filtros.doctorId)
                queryParams.append('doctorId', filtros.doctorId);
            const url = `${this.baseURL}/citas/admin${queryParams.toString() ? `?${queryParams}` : ''}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            console.error("❌ Error obteniendo citas admin:", error);
            return { success: false, data: [] };
        }
    }

    // =============================
    // 📌 PACIENTES
    // =============================
    async getPacientes() {
        try {
            const response = await fetch(`${this.baseURL}/pacientes`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            console.error("❌ Error obteniendo pacientes:", error);
            return { success: false, data: [] };
        }
    }

    // =============================
    // 📌 DOCTORES
    // =============================
    async getDoctores() {
        try {
            const response = await fetch(`${this.baseURL}/doctores`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            console.error("❌ Error obteniendo doctores:", error);
            return { success: false, data: [] };
        }
    }

    // =============================
    // 📌 CITAS
    // =============================
    async getAllCitas() {
        try {
            console.log("📅 Obteniendo TODAS las citas (admin)...");
            const response = await fetch(`${this.baseURL}/citas`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            console.error("❌ Error obteniendo todas las citas:", error);
            return { success: false, data: [] };
        }
    }

    async getCitas(usuarioId) {
        try {
            console.log(`📋 Obteniendo citas para usuario ${usuarioId}...`);
            const response = await fetch(`${this.baseURL}/citas/usuario/${usuarioId}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            console.error('❌ Error obteniendo citas:', error);
            return { success: false, data: [] };
        }
    }

    async createCita(citaData) {
        try {
            const response = await fetch(`${this.baseURL}/citas`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(citaData),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }

    async updateCita(id, citaData) {
        try {
            const response = await fetch(`${this.baseURL}/citas/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(citaData),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }

    async cancelarCita(id) {
        try {
            const response = await fetch(`${this.baseURL}/citas/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =============================
    // 🔴 NUEVAS RUTAS PARA DASHBOARD ML
    // =============================
    
    async getAlertasRiesgo() {
        try {
            console.log("🚨 Obteniendo alertas de riesgo ML...");
            const response = await fetch(`${this.baseURL}/dashboard/alertas-riesgo`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            console.error("❌ Error obteniendo alertas ML:", error);
            return { success: false, alertas: [] };
        }
    }

    async getTendenciasML() {
        try {
            console.log("📈 Obteniendo tendencias ML...");
            const response = await fetch(`${this.baseURL}/dashboard/tendencias`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            console.error("❌ Error obteniendo tendencias ML:", error);
            return { success: false, metricas: [] };
        }
    }

    async getMetricasML() {
        try {
            console.log("📊 Obteniendo métricas ML...");
            const response = await fetch(`${this.baseURL}/dashboard/metricas`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            return await this.handleResponse(response);
        }
        catch (error) {
            console.error("❌ Error obteniendo métricas ML:", error);
            return { 
                success: false, 
                data: {
                    totalPredicciones: 0,
                    alertasActivas: 0,
                    precision: 0,
                    factoresAnalizados: 0,
                    estado: "ERROR DE CONEXIÓN"
                }
            };
        }
    }

    // =============================
    // 📌 UTILIDADES
    // =============================
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    getCurrentUserId() {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    }

    isAuthenticated() {
        return !!localStorage.getItem('token') && !!localStorage.getItem('user');
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/test`);
            return await this.handleResponse(response);
        }
        catch {
            return { success: false };
        }
    }
}

const apiService = new ApiService();
export default apiService;