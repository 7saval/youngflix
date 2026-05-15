import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

export const signupSchema = z
  .object({
    email: z.string().email("유효한 이메일을 입력하세요"),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    passwordConfirm: z.string(),
    nickname: z.string().min(1, "닉네임을 입력하세요").max(50, "닉네임은 50자 이하여야 합니다"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
