FROM nginx:alpine

# Copies HTML, CSS and JS files to the Nginx server
COPY . /usr/share/nginx/html

# Exposes the default HTTP port
EXPOSE 80