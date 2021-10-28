FROM node
RUN apt-get update
WORKDIR /app
RUN npm install -g pnpm
COPY . /app
RUN pnpm i
CMD [ "pnpm", "start" ]
