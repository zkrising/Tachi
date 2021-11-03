FROM node:16
WORKDIR /app
COPY . /app
RUN apt-get update && apt-get install -y sendmail && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm && pnpm i
CMD ./hosts.sh && service sendmail start && pnpm start
