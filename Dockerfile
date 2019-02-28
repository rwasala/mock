FROM node:8
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn lint
EXPOSE 80
CMD [ "node", "index.js" ]
