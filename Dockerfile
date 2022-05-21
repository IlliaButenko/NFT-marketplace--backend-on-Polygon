FROM node:14-alpine3.13
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g @nestjs/cli
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci --production

COPY . .
RUN cp .env.production .env
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
