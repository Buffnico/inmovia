# Imagen base con Node LTS sobre Debian (permite instalar LibreOffice)
FROM node:20-bookworm

# Actualizamos paquetes e instalamos LibreOffice y fuentes básicas
# libreoffice-writer es suficiente para conversiones de texto, pero instalamos libreoffice completo por seguridad
# fonts-dejavu-core provee fuentes estándar
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libreoffice \
        libreoffice-writer \
        fonts-dejavu-core && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias de producción
RUN npm install

# Copiamos el resto del código de la API
COPY . .

# Variable de entorno para producción
ENV NODE_ENV=production

# Puerto donde escucha la API
EXPOSE 3001

# Comando de arranque
CMD ["npm", "start"]
