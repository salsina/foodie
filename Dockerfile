# Simple, tiny container
FROM node:20-alpine
WORKDIR /app
COPY relay.js .
EXPOSE 443          # Railway maps its $PORT to 443 when we expose 443
CMD ["node", "relay.js"]
