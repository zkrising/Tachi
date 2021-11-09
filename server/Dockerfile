FROM node:16
WORKDIR /app
COPY --chown=node:node . /app
USER node
RUN apt-get update && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm && pnpm i
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s CMD curl -f http://localhost:8080/api/v1/status || exit 1
CMD pnpm start
