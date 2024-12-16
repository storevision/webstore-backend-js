import { setupClient } from '@/database/db';
import applyMigrations from '@/database/migrations';
import { generateBlurredImage } from '@/database/products/generateBlurredImage';

// A type that when you pass an object, it converts every number to a string so that we parse it back to a number.
// it should work recursively, so if we have an object with an object with a number, it should convert it to a string.
export type StringifyNumbers<T> = {
    [K in keyof T]: T[K] extends number
        ? string
        : T[K] extends Date
          ? string
          : T[K] extends object
            ? StringifyNumbers<T[K]>
            : T[K];
};

// For now, leave it as it is
export type AsDatabaseResponse<T> = StringifyNumbers<T>;

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

    generateBlurredImage();
}
