module.exports = {
	'env': {
		browser: true,
		es6: true,
		node: true
	},
	extends: [
		'eslint:recommended'
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
		process: 'readonly' // replaced at compile time by webpack
	},
	parserOptions: {
		ecmaFeatures: { jsx: true },
		ecmaVersion: 11,
		sourceType: 'module'
	},
	plugins: [],
	rules: { /*'react/prop-types': 'off'*/	}
};
