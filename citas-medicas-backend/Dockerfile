FROM node:18-alpine
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar todo el código fuente
COPY . .

# Exponer puerto (ajusta si es diferente)
EXPOSE 3001

# Comando para iniciar - usa el que corresponda a tu proyecto
CMD ["node", "server.js"]
# O si tienes scripts en package.json:
# CMD ["npm", "start"]