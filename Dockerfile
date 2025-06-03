FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/package*.json ./
RUN npm ci --only=production

COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/server.js"]