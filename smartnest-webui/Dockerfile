FROM node:18-alpine

RUN mkdir /app
WORKDIR /app
ADD . /app/
RUN npm install

#ENTRYPOINT [ "/bin/bash" ]
CMD ["npm", "start"]