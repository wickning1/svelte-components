FROM node:12-alpine
WORKDIR /usr/app
COPY package.json ./
RUN npm --quiet install
COPY rollup.config.js ./
COPY src src
COPY .storybook .storybook
COPY stories stories
ENTRYPOINT ["npm"]
CMD ["start"]
