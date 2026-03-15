FROM node:18-slim

WORKDIR /app

COPY package*.json ./


RUN npm install

COPY . .

USER root
RUN mkdir -p /data && chown -R node:node /data
RUN chown -R node:node /app

EXPOSE 3000

CMD ["node", "server.js"]