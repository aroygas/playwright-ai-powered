# Image tag MUST match the pinned @playwright/test version (see docs/DESIGN.md, Playwright version lock).
FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /app
ENV CI=true

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .

# Default: the AI gate's test subset. Override with `docker compose run tests <playwright args>`.
ENTRYPOINT ["npx", "playwright", "test"]
CMD ["--grep", "@smoke"]
