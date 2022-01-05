FROM node:slim

LABEL org.opencontainers.image.source https://github.com/yannikmg/wakeonmc

WORKDIR /app
ADD src/ .

RUN apt update && apt install -y wakeonlan

RUN npm install

ENV BROADCAST 10.10.0.255
ENV MACADDRESS 00:00:00:00:00:00
ENV REDIRECTWEBPAGE https://www.google.com/
ENV PORT 3000
ENV TIMETOREDIRECT 7

CMD ["node", "app.js"]