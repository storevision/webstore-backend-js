import { configDotenv } from 'dotenv';

import initDatabase from './database';

configDotenv({ path: './backend.env' });

export default async function main(): Promise<void> {
    initDatabase();
}

main();
