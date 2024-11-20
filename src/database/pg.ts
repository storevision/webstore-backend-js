import { Client } from 'pg';

// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
let _client: Client | null = null;

const getClient = (): Client => {
    if (!_client) {
        throw new Error('Database not initialized');
    }

    return _client;
};

export interface SetupClientArgs {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export async function setupClient(clientArgs: SetupClientArgs): Promise<void> {
    _client = new Client(clientArgs);

    try {
        await _client.connect();

        console.log('Database connection established');
    } catch (error) {
        console.error('Failed to connect to database:', error);

        throw error;
    }
}

export default getClient;
