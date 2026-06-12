FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY packages/shared-types ./packages/shared-types

COPY apps/backend/package*.json ./apps/backend/
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/src ./apps/backend/src

RUN npm install

WORKDIR /app/apps/backend
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]