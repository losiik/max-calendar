
ARG APP_PATH=frontend

FROM node:20.18-alpine3.20 AS build
ARG APP_PATH
WORKDIR /app

COPY ${APP_PATH}/package*.json ./
RUN npm install --include=dev --ignore-scripts --legacy-peer-deps

COPY ${APP_PATH}/ ./
RUN npm run build

FROM node:20.18-alpine3.20 AS runner
WORKDIR /app


RUN addgroup -g 1001 app && adduser -D -G app -u 1001 app

ENV NODE_ENV=production

RUN npm install -g vite@4.4.5

COPY --from=build /app/dist ./dist

USER app
EXPOSE 4173

CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "4173", "--outDir", "dist"]
