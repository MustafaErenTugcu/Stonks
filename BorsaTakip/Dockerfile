# Build aşaması
FROM node:16 AS build-stage

WORKDIR /app
COPY . .

RUN npm install -g @angular/cli@15
RUN npm install
RUN ng build --configuration production

# Serve aşaması (Nginx ile)
FROM nginx:alpine
COPY --from=build-stage /app/dist/borsa-takip /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
