# frontend/Dockerfile
# -----------------------------------
# STAGE 1: Build do Angular
# -----------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Copia arquivos de configuração de dependências
COPY package.json package-lock.json ./
RUN npm install # Instala as dependências

# Copia o restante do código e compila
COPY . .
# Adapte o comando 'ng build' conforme a sua configuração de Angular
RUN npm run build -- --output-path=./dist --configuration=production

# -----------------------------------
# STAGE 2: Imagem Final (Servir com Nginx)
# -----------------------------------
FROM nginx:alpine AS final

# Copia arquivo de configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o resultado da compilação para o diretório padrão do Nginx
COPY --from=build /app/dist/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]