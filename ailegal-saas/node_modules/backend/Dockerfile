FROM node:20-alpine

WORKDIR /app

# Copia o pacote compartilhado primeiro
COPY ../../packages/shared-types ./packages/shared-types

# Copia o backend
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Instala dependências
RUN npm install

# Compila
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]