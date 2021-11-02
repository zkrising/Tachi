FROM node
RUN apt-get update
WORKDIR /app
RUN apt-get install sendmail
RUN npm install -g pnpm
COPY . /app
RUN pnpm i
CMD service sendmail start && pnpm start
