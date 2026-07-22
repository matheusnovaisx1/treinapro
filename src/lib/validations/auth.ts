import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupPersonalSchema = z
  .object({
    fullName: z.string().min(2, 'Informe seu nome completo'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Mínimo de 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo de 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type SignupPersonalInput = z.infer<typeof signupPersonalSchema>;

export const acceptInviteSchema = z
  .object({
    fullName: z.string().min(2, 'Informe seu nome completo'),
    email: z.string().email('E-mail inválido'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Mínimo de 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo de 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
