FROM node:22.14.0

RUN apt-get update && apt-get install -y \
    git

RUN mkdir /app
WORKDIR /app
ADD ./smartnest-webui/* /app/

ENTRYPOINT [ "npm" ]
CMD [ "start" ]