import { configDotenv } from 'dotenv';

import app from '@/api';
import initDatabase from '@/database';

configDotenv({ path: './backend.env' });

export async function init(): Promise<void> {
    const portStr = process.env.PORT || '1337';

    const webPort = parseInt(portStr, 10);

    if (Number.isNaN(webPort)) {
        throw new Error(`Invalid port: ${portStr}`);
    }

    await initDatabase();

    app.listen(webPort);

    console.log('Initialization complete');
}

export default async function main(): Promise<void> {
    await init();
}

main();
