# base image
FROM node:14-alpine

# work directory
WORKDIR /app

# app dependencies
COPY package*.json ./

# install app dependencies
RUN npm install --only=production

# copy app source
COPY . .

EXPOSE 80

# start command
CMD [ "npm", "start" ]