// services/dashboardService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const dashboardService = {
    getAlertasRiesgo: async () => {
        const response = await axios.get(`${API_BASE}/dashboard/alertas-riesgo`);
        return response.data;
    },
    
    getTendencias: async () => {
        const response = await axios.get(`${API_BASE}/dashboard/tendencias`);
        return response.data;
    },
    
    actualizarPredicciones: async () => {
        const response = await axios.post(`${API_BASE}/dashboard/actualizar-predicciones`);
        return response.data;
    }
};