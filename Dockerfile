FROM node:lts
WORKDIR /usr/local/app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install
RUN npm run build

# ## this is stage two , where the app actually runs
FROM node:lts
WORKDIR /usr
COPY package.json ./
COPY docs ./docs
RUN npm install
COPY --from=0 /usr/local/app/build ./
ENV NODE_ENV production

CMD ["node", "index.js"]