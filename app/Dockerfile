FROM python:3.10-slim-bullseye
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
RUN mkdir -p /app/smartnest/data

CMD ["python", "app.py"]