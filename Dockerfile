FROM node:18

# Criar diretório da aplicação
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./
COPY yarn.lock ./

# Instalar dependências
RUN yarn install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 80

# Comando para iniciar a aplicação
CMD [ "yarn", "start" ]