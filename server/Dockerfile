FROM node:16
WORKDIR /app
COPY . /app
RUN apt-get update && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm && pnpm i
CMD pnpm start
