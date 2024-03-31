FROM nginx

# install openssl
RUN apt-get update && apt-get install -y openssl

RUN mkdir -p /etc/nginx/ssl

# create a self-signed certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048\
	-keyout /etc/nginx/ssl/nginx-selfsigned.key\
	-out /etc/nginx/ssl/nginx-selfsigned.crt\
	-subj "/C=FR/ST=Rhone/L=Lyon/O=42/OU=42/CN=localhost"

# copy the configuration file
COPY ./nginx.conf /etc/nginx/conf.d/

# expose the ports
EXPOSE 80 443

# start the server
# CMD ["nginx", "-g", "daemon off;"]