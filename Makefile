# Makefile for the adityaojha portfolio (Next.js 16 / Turbopack).
#
# All targets are npm-driven. The dev server normally runs on
# http://localhost:3000; starting a second one fails with
# "Another next dev server is already running", so reuse the existing one.

.PHONY: help install dev build start lint typecheck registry-build clean

# Default goal
help:
	@echo "Available commands:"
	@echo "  make install         - Install dependencies"
	@echo "  make dev             - Start the dev server on http://localhost:3000"
	@echo "  make build           - Build the production bundle (registry build + next build)"
	@echo "  make start           - Serve the production build"
	@echo "  make lint            - Run ESLint across the repo"
	@echo "  make typecheck       - Run tsc --noEmit"
	@echo "  make registry-build  - Rebuild public/r/*.json from registry.json"
	@echo "  make clean           - Remove .next, node_modules, and public/r"

install:
	npm install

dev:
	npm run dev

# npm run build already runs prebuild (registry build) then next build.
build:
	npm run build

start:
	npm run start

lint:
	npm run lint

typecheck:
	npx tsc --noEmit

registry-build:
	npm run registry:build

clean:
	rm -rf .next
	rm -rf node_modules
	rm -rf public/r