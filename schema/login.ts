import z from 'zod';

export const validLogin = z.object({
  email: z.string().email({message:'invalid Email'}),
  password:z.string().min(8,{message:"invalid Password"})
})