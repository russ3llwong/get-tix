import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: string;
    email: string;
}

// modify existing type-definition
declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

export const currentUser = (
    req: Request,
    res: Response,
    next: NextFunction
    ) => {
        if(!req.session?.jwt) {
            return next();
        }

        try {
            // define as UserPayload object so it can bind onto Request object as defined above
            const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
            req.currentUser = payload;
        } catch (err) {
            console.log('Error in current-user middleware.')
        }

        next();
};