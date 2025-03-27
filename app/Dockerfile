FROM ubuntu:noble

RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    software-properties-common \
    portaudio19-dev

RUN add-apt-repository ppa:deadsnakes/ppa

RUN apt-get update && apt-get install -y python3.10 \
    python3.10-venv \
    python3.10-dev

RUN mkdir -p /app
WORKDIR /app
ADD ./requirements.txt /app/requirements.txt
RUN python3.10 -m venv venv
RUN . venv/bin/activate && pip install -r requirements.txt

ADD . /app/

ENTRYPOINT [ "venv/bin/python" ]
CMD [ "app.py" ]