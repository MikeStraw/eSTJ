module.exports = {
    root: true,
    env: {
        "es6": true,
        node: true
    },
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    extends: [
        'plugin:vue/base'
    ],
    rules: {
        indent: ["warn", 4],
        'vue/script-indent': ['warn', 4, { 'baseIndent': 0 }],
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "quotes": ["warn", "single"],
        "semi": ["warn", "never"]
    },
    "overrides": [
        {
            "files": ["*.vue"],
            "rules": {
                "indent": "off"
            }
        }
    ]
};
