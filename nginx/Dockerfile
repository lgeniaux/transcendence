FROM nginx

# install openssl
RUN apt-get update && apt-get install -y openssl

# create a self-signed certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048\
	-keyout /etc/ssl/private/nginx-selfsigned.key\
	-out /etc/ssl/certs/nginx-selfsigned.crt\
	-subj "/C=FR/ST=Rhone/L=Lyon/O=42/OU=42/CN=localhost"

# copy the configuration file
COPY ./nginx.conf /etc/nginx/nginx.conf

# expose the ports
EXPOSE 80 443

# start the server
CMD ["nginx", "-g", "daemon off;"]