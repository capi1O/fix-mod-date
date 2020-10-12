module.exports = {
	'env': {
		browser: true,
		es6: true,
		node: true,
		mocha: true
	},
	extends: [
		'eslint:recommended'
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
		process: 'readonly' // replaced at compile time by webpack
	},
	parser: '@babel/eslint-parser',
	parserOptions: {
		ecmaFeatures: { jsx: true },
		ecmaVersion: 11,
		sourceType: 'module'
	},
	plugins: [],
	rules: { /*'react/prop-types': 'off'*/	}
};
