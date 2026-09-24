
FROM node:26-alpine3.23 AS builder
WORKDIR /app
COPY package.json ./
RUN npm install 
COPY . .

ARG BACKEND_URL

ENV REACT_APP_BACKEND_URL ${BACKEND_URL}

RUN npm run build

FROM node:26-alpine3.23 AS runner

WORKDIR /app
COPY --from=builder /app/build ./dist
RUN npm install serve@^14.2.6  

EXPOSE 3000

CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
