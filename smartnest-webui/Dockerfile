FROM node:18-alpine

RUN apt-get update && apt-get install -y \
    git

RUN mkdir /app
WORKDIR /app
ADD . /app/
RUN npm install

#ENTRYPOINT [ "/bin/bash" ]
ENTRYPOINT [ "npm" ]
CMD [ "start" ]