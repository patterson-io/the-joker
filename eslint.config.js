export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        performance: "readonly",
        navigator: "readonly",
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        btoa: "readonly",
        atob: "readonly",
        structuredClone: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "prefer-const": "error",
      "no-var": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "object-shorthand": "error",
      "prefer-destructuring": "error",
      "no-console": "warn",
      "eqeqeq": "error",
      "no-throw-literal": "error",
      "prefer-promise-reject-errors": "error"
    }
  }
];