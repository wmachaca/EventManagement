# Use official Node image (you can adjust version)
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and lock file first (for caching)
COPY package.json package-lock.json ./

# Install deps
ENV NODE_ENV=development
RUN npm ci \
  && echo "--- Installed packages ---" \
  && npm ls --depth=1 \
  && echo "--- Contents of node_modules/.bin ---" \
  && ls -la node_modules/.bin || echo ".bin directory is missing"
#RUN npm install --include=dev 
#RUN ls -la node_modules
RUN if [ -d node_modules/.bin ]; then ls -la node_modules/.bin; else echo ".bin directory not found (that's okay if no binaries are installed)"; fi 
# Copy the rest of the app
COPY . .

# Expose the dev port
EXPOSE 3000

# Run dev server
CMD ["npm", "run", "dev"]

# production build
#RUN npm run build
#CMD ["npm", "start"]
