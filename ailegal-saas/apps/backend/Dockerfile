FROM node:20-alpine

WORKDIR /app

# Copia o pacote compartilhado
COPY packages/shared-types ./packages/shared-types

# Copia o backend com caminho correto a partir do contexto ailegal-saas
COPY apps/backend/package*.json ./
COPY apps/backend/tsconfig.json ./
COPY apps/backend/src ./src

# Instala dependências
RUN npm install

# Compila
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]