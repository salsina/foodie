FROM node:20-alpine
WORKDIR /app
COPY relay.js .
# ↓ either expose the port **without an inline comment** …
EXPOSE 443

# …or omit EXPOSE entirely (Railway still works without it)
CMD ["node", "relay.js"]
