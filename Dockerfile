FROM node:14

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
EXPOSE 3333

# Comando para iniciar a aplicação
CMD [ "yarn", "start" ]
