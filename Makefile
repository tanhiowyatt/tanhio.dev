.PHONY: install start test coverage clean help

# Default goal
help:
	@echo "Available commands:"
	@echo "  make install   - Install dependencies for app and tests"
	@echo "  make start     - Start the production server"
	@echo "  make test      - Run all tests (unit, integration, security, a11y)"
	@echo "  make coverage  - Run tests and show coverage report"
	@echo "  make clean     - Remove node_modules and coverage reports"

install:
	npm install
	cd tests && npm install

start:
	npm start

test:
	npm test

coverage:
	npm run test:coverage

clean:
	rm -rf node_modules
	rm -rf tests/node_modules
	rm -rf tests/coverage
	rm -rf tests/test-results
