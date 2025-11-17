import { z } from "zod";

// 로그인 스키마
export const loginSchema = z.object({
    username: z
        .string()
        .min(1, "사용자 이름을 입력해주세요")
        .min(3, "사용자 이름은 최소 3자 이상이어야 합니다"),
    password: z
        .string()
        .min(1, "비밀번호를 입력해주세요")
        .min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

// 회원가입 스키마
export const signUpSchema = z.object({
    name: z
        .string()
        .min(1, "이름을 입력해주세요")
        .min(2, "이름은 최소 2자 이상이어야 합니다"),
    email: z
        .string()
        .min(1, "이메일을 입력해주세요")
        .email("올바른 이메일 형식이 아닙니다"),
    username: z
        .string()
        .min(1, "사용자 이름을 입력해주세요")
        .min(3, "사용자 이름은 최소 3자 이상이어야 합니다")
        .regex(/^[a-zA-Z0-9_]+$/, "사용자 이름은 영문, 숫자, 언더스코어만 사용할 수 있습니다"),
    password: z
        .string()
        .min(1, "비밀번호를 입력해주세요")
        .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
        .regex(/[A-Za-z]/, "비밀번호는 최소 하나의 영문자를 포함해야 합니다")
        .regex(/[0-9]/, "비밀번호는 최소 하나의 숫자를 포함해야 합니다"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

