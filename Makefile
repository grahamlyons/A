.PHONY: test

LITMUS=node_modules/litmus/bin/litmus

${LITMUS}:
	npm config set dev true
	npm install

test: ${LITMUS}
	${LITMUS} test/A-test.js
