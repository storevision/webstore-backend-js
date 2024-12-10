import bcrypt from 'bcrypt';
import getClient from 'database/db';
import type { DatabaseError } from 'pg';

import type { TokenUsers } from '@/api/cookies';
import type Users from '@/schemas/public/Users';

export interface RegisterUserArgs {
    displayName: string;
    email: string;
    password: string;
}

export class UserAlreadyExistsError extends Error {
    constructor() {
        super('User already exists');
        this.name = 'UserAlreadyExistsError';
    }
}

export const registerUser = async ({
    displayName,
    email,
    password,
}: RegisterUserArgs): Promise<Users> => {
    const client = await getClient();

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const { rows } = await client.query<Users>(
            'INSERT INTO users (display_name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [displayName, email, passwordHash],
        );

        return rows[0];
    } catch (error) {
        if ((error as DatabaseError).code === '23505') {
            // unique_violation
            throw new UserAlreadyExistsError();
        }

        throw error;
    } finally {
        client.release();
    }
};

export const verifyUser = async (
    email: string,
    password: string,
): Promise<Users | null> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<Users>(
            'SELECT * FROM users WHERE email = $1',
            [email],
        );

        const user = rows[0];

        if (!user) {
            return null;
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash,
        );

        if (!passwordMatch) {
            return null;
        }

        return user;
    } finally {
        client.release();
    }
};

export const getUserByEmail = async (email: string): Promise<Users | null> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<Users>(
            'SELECT * FROM users WHERE email = $1',
            [email],
        );

        return rows[0] || null;
    } finally {
        client.release();
    }
};

export const verifyUserByObject = async (
    tokenCookie: TokenUsers,
): Promise<boolean> => {
    const user = tokenCookie;

    const userFromDb = await getUserByEmail(user.email);

    if (!userFromDb) {
        console.log('User not found in database');
        return false;
    }

    const passwordChangedAt = Math.floor(
        new Date(userFromDb.password_changed_at).getTime() / 1000,
    );

    const passwordChangedAfterTokenIssued = passwordChangedAt > user.iat;

    return userFromDb.id === user.id && !passwordChangedAfterTokenIssued;
};
