const { configDotenv } = require("dotenv");

configDotenv({
    path: 'backend.env',
});

/** @type {import('kanel').Config} */
module.exports = {
    connection: {
        host: process.env.POSTGRES_HOST ?? "localhost",
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
    },

    preDeleteOutputFolder: true,
    outputPath: "./src/schemas",

    customTypeMap: {
        "pg_catalog.tsvector": "string",
        "pg_catalog.bpchar": "string",
    },
};
