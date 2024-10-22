import z from 'zod';

export const validRegister = z.object({
  userName: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  role:z.string().optional(),
  address1:z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
});