FROM node:22-alpine
WORKDIR /src
COPY . .
RUN npm install
RUN npm run docker
EXPOSE 3000
CMD npm run web