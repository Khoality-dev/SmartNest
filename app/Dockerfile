FROM python:3.10-slim-bullseye AS base

RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    software-properties-common \
    portaudio19-dev

RUN mkdir -p /app
WORKDIR /app
ADD ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

ADD . /app/

FROM base AS dev

ENTRYPOINT [ "python" ]
CMD [ "app.py" ]

FROM base AS prod

ENTRYPOINT [ "gunicorn" ]
CMD [ "--bind", "0.0.0.0:5000", "--workers", "4", "wsgi:app" ]