import type { PoolClient } from 'pg';
import { Pool } from 'pg';

// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
let _pool: Pool | null = null;

const getClient = async (): Promise<PoolClient> => {
    if (!_pool) {
        throw new Error('Database not initialized');
    }

    return _pool.connect();
};

export interface SetupClientArgs {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export async function setupClient(clientArgs: SetupClientArgs): Promise<void> {
    _pool = new Pool(clientArgs);

    try {
        // check if the connection is successful
        const client = await _pool.connect();

        const response = await client.query('SELECT NOW()');

        console.log('Database connection established:', response.rows[0].now);

        client.release();

        console.log('Database connection established');
    } catch (error) {
        console.error('Failed to connect to database:', error);

        throw error;
    }
}

export default getClient;
