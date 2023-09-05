# base image
FROM node:14

# work directory
WORKDIR /app

# app dependencies
COPY package*.json ./

# install app dependencies
RUN npm install

# copy app source
COPY . .

EXPOSE 80

# start command
CMD [ "npm", "start" ]