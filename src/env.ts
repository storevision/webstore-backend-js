import { configDotenv } from 'dotenv';

configDotenv({ path: './backend.env' });

const envVars = {
    JWT_SECRET: { type: 'string', required: true },
    PORT: { type: 'number', required: false },
};

export function verifyEnvVars(): void {
    for (const [name, { type, required }] of Object.entries(envVars)) {
        if (required && !process.env[name]) {
            throw new Error(`Missing required environment variable: ${name}`);
        }

        if (
            type === 'number' &&
            process.env[name] &&
            Number.isNaN(parseInt(process.env[name] as string, 10))
        ) {
            throw new Error(
                `Invalid value for environment variable ${name}: ${process.env[name]}`,
            );
        }

        if (
            type === 'boolean' &&
            process.env[name] &&
            !['true', 'false'].includes(process.env[name] as string)
        ) {
            throw new Error(
                `Invalid value for environment variable ${name}: ${process.env[name]}`,
            );
        }
    }
}

verifyEnvVars();
