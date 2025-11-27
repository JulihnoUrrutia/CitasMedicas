# -------- FASE 1: Build del proyecto --------
    FROM node:18-alpine AS build

    WORKDIR /app
    
    # Copiamos package.json y package-lock.json
    COPY package*.json ./
    
    # Instalamos dependencias
    RUN npm install
    
    # Copiamos todo el frontend
    COPY . .
    
    # Ejecutamos el build de Vite
    RUN npm run build
    
    
    # -------- FASE 2: Servidor web para producción --------
    FROM nginx:alpine
    
    # Copiamos la carpeta dist generada por Vite
    COPY --from=build /app/dist /usr/share/nginx/html
    
    EXPOSE 5173
    
    CMD ["nginx", "-g", "daemon off;"]
    