import applyMigrations from './migrations';
import { setupClient } from './pg';

async function initDatabaseConnection(): Promise<void> {
    const {
        POSTGRES_HOST = 'localhost',
        POSTGRES_PORT = '5432',
        POSTGRES_USER,
        POSTGRES_PASSWORD,
        POSTGRES_DB,
    } = process.env;

    if (!POSTGRES_HOST) {
        throw new Error(
            'Missing required environment variable "POSTGRES_HOST"',
        );
    }

    if (!POSTGRES_PORT) {
        throw new Error(
            'Missing required environment variable "POSTGRES_PORT"',
        );
    }

    if (!POSTGRES_USER) {
        throw new Error(
            'Missing required environment variable "POSTGRES_USER"',
        );
    }

    if (!POSTGRES_PASSWORD) {
        throw new Error(
            'Missing required environment variable "POSTGRES_PASSWORD"',
        );
    }

    if (!POSTGRES_DB) {
        throw new Error('Missing required environment variable "POSTGRES_DB"');
    }

    await setupClient({
        host: POSTGRES_HOST,
        port: parseInt(POSTGRES_PORT, 10),
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DB,
    });
}

export default async function initDatabase(): Promise<void> {
    await initDatabaseConnection();

    await applyMigrations();
}
