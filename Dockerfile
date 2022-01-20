FROM node:17
WORKDIR /usr/local/app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install -g npm
RUN npm install
RUN npm run build

# ## this is stage two , where the app actually runs
FROM node:17
WORKDIR /usr
COPY package.json ./
RUN npm install -g npm
RUN npm install
COPY --from=0 /usr/local/app/build ./
ENV NODE_ENV production

CMD ["npm", "run", "start"]