import type express from 'express';
import jwt from 'jsonwebtoken';

import { verifyUserByObject } from '@/database/users';
import type Users from '@/schemas/public/Users';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

export interface TokenUsers
    extends Pick<Users, 'id' | 'email' | 'display_name' | 'picture_data_url'> {
    iat: number;
    exp: number;
}

export const verifyRequest = async <
    TReq extends express.Request,
    TRes extends express.Response,
>(
    req: TReq,
    res: TRes,
    sendError: boolean = true,
): Promise<TokenUsers | null> => {
    const { token } = req.cookies;

    if (!token) {
        console.log(
            `${req.method} ${req.originalUrl} - No token (${req.ip}, ${req.headers['user-agent']})`,
        );
        if (sendError) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        return null;
    }

    try {
        const user = jwt.verify(token, JWT_SECRET) as TokenUsers;

        const verified = await verifyUserByObject(user);

        if (!verified) {
            console.log('user not verified');
            if (sendError) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }
            return null;
        }

        return user;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.log('token expired');
            if (sendError) {
                res.status(401).json({
                    success: false,
                    message: 'Token expired',
                });
            }
            return null;
        }

        console.error('Error verifying token:', error);
        if (sendError) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
        }
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
            picture_data_url: user.picture_data_url,
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
