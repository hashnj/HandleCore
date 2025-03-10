import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtSecret } from '../config';

const auth = (req: Request, res: Response, next: NextFunction): any => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const verified = jwt.verify(token, JwtSecret as string) as { id: string }; 
    req.user_id = (verified as {id:string}).id;
    next(); 
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden' });
  }
};

export default auth;
