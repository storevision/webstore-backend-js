import type express from 'express';
import jwt from 'jsonwebtoken';

import { verifyUserByObject } from '@/database/users';
import type Users from '@/schemas/public/Users';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

export interface TokenUsers
    extends Pick<Users, 'id' | 'email' | 'display_name'> {
    iat: number;
    exp: number;
}

export const verifyRequest = async (
    req: express.Request,
    res: express.Response,
): Promise<TokenUsers | null> => {
    const { token } = req.cookies;

    if (!token) {
        console.log(
            `${req.method} ${req.url} - No token (${req.ip}, ${req.headers['user-agent']})`,
        );
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return null;
    }

    try {
        const user = jwt.verify(token, JWT_SECRET) as TokenUsers;

        const verified = await verifyUserByObject(user);

        if (!verified) {
            console.log('user not verified');
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return null;
        }

        return user;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.log('token expired');
            res.status(401).json({ success: false, message: 'Token expired' });
            return null;
        }

        console.error('Error verifying token:', error);
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    return null;
};

const inDays = (n: number): number => n * 24 * 60 * 60 * 1000 + Date.now();

export const setCookie = (
    req: express.Request,
    res: express.Response,
    user: Users,
    keepLoggedIn: boolean = false,
): void => {
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
        } as TokenUsers,
        JWT_SECRET,
        {
            expiresIn: keepLoggedIn ? '30d' : '1d',
        },
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: req.secure,
        sameSite: 'strict',
        // if keepLoggedIn is true, set the cookie to expire in 30 days.
        // otherwise, let cookie last only for session
        expires: keepLoggedIn ? new Date(inDays(30)) : undefined,
        // maxAge: keepLoggedIn ? inDays(30) : inDays(1),
    });

    /* console.log(
        'Set cookie:',
        res.getHeaders()['set-cookie'],
        req.secure,
        user,
    ); */
};

export const clearCookie = (res: express.Response): void => {
    res.clearCookie('token');
};

export default { verifyRequest, setCookie, clearCookie };
