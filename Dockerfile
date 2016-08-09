FROM node:latest

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Bundle app source
COPY . /app

RUN npm install

VOLUME /docker

CMD [ "npm", "start", "/docker" ]
