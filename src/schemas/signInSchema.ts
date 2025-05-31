import { z } from 'zod';
import { passwordValidation } from './signUpSchema';

export const signInSchema = z.object({
      identifier: z.string().min(3, { message: 'Identifier must be at least 3 characters long' }),
      password: passwordValidation
})