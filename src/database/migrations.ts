import fs from 'fs';
import type { DatabaseError } from 'pg';

import getClient from '@/database/db';

export interface Migration {
    version: number;
    file: string;
}

async function executeMigration(migration: Migration): Promise<void> {
    const client = await getClient();

    const query = fs.readFileSync(`./sql/${migration.file}`, 'utf-8');

    console.log('Executing migration:', migration.file);

    try {
        await client.query('BEGIN');

        await client.query(query);

        await client.query(
            'INSERT INTO metadata (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
            ['db_version', migration.version.toString()],
        );

        await client.query('COMMIT');

        console.log('Migration applied:', migration.file);
    } catch (error) {
        await client.query('ROLLBACK');

        throw error;
    }
}

async function findMigrations(): Promise<Migration[]> {
    const files = fs.readdirSync('./sql');

    // match regex for .sql files. "000-name.sql" is the format
    const migrations = files.filter(file => file.match(/^\d+-.*\.sql$/)).sort();

    // parse the version from the filename
    return migrations.map(file => {
        const version = parseInt(file.split('-')[0], 10);
        return { version, file };
    });
}

export async function getCurrentDatabaseVersion(): Promise<number> {
    const client = await getClient();

    try {
        const query = 'SELECT value FROM metadata WHERE key = $1';

        const { rows } = await client.query(query, ['db_version']);

        if (rows.length === 0) {
            return -1;
        }

        return parseInt(rows[0].value, 10);
    } catch (error) {
        // if the metadata table does not exist, return -1
        if ((error as DatabaseError).code === '42P01') {
            return -1;
        }

        throw error;
    }
}

export default async function applyMigrations(): Promise<void> {
    const migrations = await findMigrations();

    console.log('Found migrations:', migrations.length);

    const version = await getCurrentDatabaseVersion();

    console.log('Current database version:', version);

    for await (const migration of migrations) {
        if (migration.version > version) {
            console.log('Applying migration:', migration.file);

            await executeMigration(migration);
        }
    }

    console.log('All migrations applied');
}
