import express, { Request, Response, Router } from 'express';
import { validLogin } from '../schema/login';
import { validRegister } from '../schema/register';
import { Users, User } from '../models/Users';
import { JwtSecret } from '../config';
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword } from '../utils/password'; 
import auth from '../middleware/auth';

const authRouter: Router = express.Router();

authRouter.post('/signin', async (req: Request, res: Response): Promise<any> => {
  const { body } = req;

  const validationResult = validLogin.safeParse(body);
  if (!validationResult.success) {
    return res.status(400).json({ errors: validationResult.error.errors });
  }

  const { email, password } = validationResult.data;

  try {
    const user: User | null = await Users.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: 'User not registered' });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id.toString() }, JwtSecret as string);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.status(200).json({
      username: user.userName,
      email: user.email,
      address: user.addresses,
      role: user.role,
    });
  } catch (error) {
    console.error('Error during sign-in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

authRouter.post('/signup', async (req: Request, res: Response): Promise<any> => {
  const { body } = req;

  const validationResult = validRegister.safeParse(body);
  if (!validationResult.success) {
    return res.status(400).json({ errors: validationResult.error.errors });
  }

  const { userName, address1, city, state, postalCode, email, password } = validationResult.data;

  try {
    const exists: User | null = await Users.findOne({ email });
    if (exists) {
      return res.status(401).json({ message: 'User already registered' });
    }

    const encryptedPassword = await hashPassword(password);

    const user: User = await Users.create({
      userName,
      address1,
      city,
      state,
      postalCode,
      email,
      password: encryptedPassword,
    });

    const token = jwt.sign({ id: user._id.toString() }, JwtSecret as string);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

authRouter.post('/', auth, async (req: Request, res: Response) => {
  const userId = req.user_id;
  const user: User | null = await Users.findById(userId);
  if (user) {
    res.status(200).json({
      username: user.userName,
      email: user.email,
      address: user.addresses,
      role: user.role,
    });
  }
});

authRouter.post('/logout', auth, async (_req: Request, res: Response): Promise<any> => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
});

export default authRouter;