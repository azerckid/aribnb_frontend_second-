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
export const signUpSchema = z
    .object({
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
        passwordConfirm: z
            .string()
            .min(1, "비밀번호 확인을 입력해주세요"),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: "비밀번호가 일치하지 않습니다",
        path: ["passwordConfirm"],
    });

// 방 업로드 스키마
export const uploadRoomSchema = z.object({
    name: z
        .string()
        .min(1, "방 이름을 입력해주세요")
        .min(2, "방 이름은 최소 2자 이상이어야 합니다"),
    country: z
        .string()
        .min(1, "국가를 입력해주세요"),
    city: z
        .string()
        .min(1, "도시를 입력해주세요"),
    address: z
        .string()
        .min(1, "주소를 입력해주세요"),
    price: z
        .string()
        .min(1, "가격을 입력해주세요")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0, "가격은 0보다 큰 숫자여야 합니다"),
    rooms: z
        .string()
        .min(1, "방 개수를 입력해주세요")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= 0, "방 개수는 0 이상의 숫자여야 합니다"),
    toilets: z
        .string()
        .min(1, "화장실 개수를 입력해주세요")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= 0, "화장실 개수는 0 이상의 숫자여야 합니다"),
    description: z
        .string()
        .min(1, "설명을 입력해주세요")
        .min(10, "설명은 최소 10자 이상이어야 합니다"),
    pet_friendly: z
        .string()
        .optional()
        .transform((val) => val === "on" || val === "true"),
    kind: z
        .enum(["entire_place", "private_room", "shared_room"], {
            message: "방 종류를 선택해주세요",
        }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type UploadRoomInput = z.infer<typeof uploadRoomSchema>;

