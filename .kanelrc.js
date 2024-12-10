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
        "pg_catalog.float8": "number",
        "pg_catalog.float4": "number",
        "pg_catalog.numeric": "number",
        "pg_catalog.int8": "number",
        "pg_catalog.int4": "number",
        "pg_catalog.int2": "number",
    },
};
