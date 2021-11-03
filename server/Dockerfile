FROM node
RUN apt-get update
WORKDIR /app
RUN apt-get install -y sendmail
RUN npm install -g pnpm
COPY . /app
RUN pnpm i
CMD ./hosts.sh && service sendmail start && pnpm start
