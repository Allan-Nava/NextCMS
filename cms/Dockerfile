# Build target base #
#####################
FROM node:17.4-stretch AS base
WORKDIR /app
ARG NODE_ENV=production
ENV PATH=/app/node_modules/.bin:$PATH \
    NODE_ENV="$NODE_ENV"
RUN apt -y install curl
COPY package.json /app/
EXPOSE 3000
#
# Build target dependencies #
#############################
FROM base AS dependencies
# Install prod dependencies
RUN npm install --production && \
    # Cache prod dependencies
    cp -R node_modules /prod_node_modules && \
    # Install dev dependencies
    npm install --production=false
#
# Build target development #
############################
FROM dependencies AS development
COPY . /app
CMD [ "npm", "run", "dev" ]
#
# Build target builder #
########################
FROM base AS builder
COPY --from=dependencies /app/node_modules /app/node_modules
#COPY --from=dependencies /app/next.config.js /app/next.config.js
COPY . /app
RUN npm run build && \
    rm -rf node_modules
#
# Build target production #
###########################
FROM base AS production
COPY --from=builder /app/public /app/public
COPY --from=builder /app/.next /app/.next
COPY --from=dependencies /prod_node_modules /app/node_modules
CMD [ "npm", "start" ]
#
