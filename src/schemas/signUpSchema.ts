import { z } from 'zod';

export const passwordValidation = z.string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(100, { message: 'Password must be at most 100 characters long' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[\W_]/, { message: 'Password must contain at least one special character' })


export const usernameValidation = z
  .string()
  .min(3, { message: 'Username must be at least 3 characters long' })
  .max(20, { message: 'Username must be at most 20 characters long' })
  .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' });

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: 'Invalid email address' }),
  password: passwordValidation,

})