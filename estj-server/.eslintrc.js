module.exports = {
    root: true,
    env: {
        "es6": true,
        node: true
    },
    "parserOptions": {
        "ecmaVersion": 2017
    },
    rules: {
        indent: ["warn", 4],
        "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "quotes": ["warn", "single"],
        "semi": ["warn", "never"]
    }
};
