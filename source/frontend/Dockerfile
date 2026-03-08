# Dockerfile
# Base image con Node.js (versione LTS)
FROM node:20-alpine

# Imposta la working directory
WORKDIR /app

# Copia package.json e package-lock.json per installare le dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il codice
COPY . .

# Espone la porta di webpack-dev-server
EXPOSE 3000

# Comando per avviare il frontend in sviluppo
CMD ["npm", "start"]