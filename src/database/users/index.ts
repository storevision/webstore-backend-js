import bcrypt from 'bcrypt';
import getClient from 'database/db';
import type { DatabaseError } from 'pg';
import { generateIdenticonDataUrl } from 'simple-identicon';

import type { TokenUsers } from '@/api/cookies';
import type { AsDatabaseResponse } from '@/database';
import type Users from '@/schemas/public/Users';
import type { UsersId } from '@/schemas/public/Users';

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
        await client.query('BEGIN');

        const { rows } = await client.query<AsDatabaseResponse<Users>>(
            `INSERT INTO users (
               display_name,
               email,
               password_hash
            )
            VALUES ($1, $2, $3)
            RETURNING *`,
            [displayName, email, passwordHash],
        );

        let identicon = null;

        if (rows.length === 1) {
            identicon = generateIdenticonDataUrl(email);

            await client.query(
                `
                UPDATE users
                SET picture_data_url = $1
                WHERE id = $2
                `,
                [identicon, rows[0].id],
            );
        }

        await client.query('COMMIT');

        return {
            ...rows[0],
            password_changed_at: new Date(rows[0].password_changed_at),
            picture_data_url: identicon,
            id: parseInt(rows[0].id as unknown as string, 10) as UsersId,
        };
    } catch (error) {
        await client.query('ROLLBACK');

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
        const { rows } = await client.query<AsDatabaseResponse<Users>>(
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

        return {
            ...user,
            password_changed_at: new Date(user.password_changed_at),
            id: parseInt(user.id as unknown as string, 10) as UsersId,
        };
    } finally {
        client.release();
    }
};

export const getUserByEmail = async (email: string): Promise<Users | null> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<AsDatabaseResponse<Users>>(
            'SELECT * FROM users WHERE email = $1',
            [email],
        );

        if (rows.length === 0) {
            return null;
        }

        return {
            ...rows[0],
            password_changed_at: new Date(rows[0].password_changed_at),
            id: parseInt(rows[0].id as unknown as string, 10) as UsersId,
        };
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

    if (passwordChangedAfterTokenIssued) {
        console.warn(
            'Password changed after token issued, time difference:',
            passwordChangedAt - user.iat,
            'seconds',
            Math.floor(userFromDb.password_changed_at.getTime() / 1000),
            user.iat,
        );
    }

    return userFromDb.id === user.id && !passwordChangedAfterTokenIssued;
};
