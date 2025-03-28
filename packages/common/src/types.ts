import {z } from 'zod';

export const CreateUserSchema = z.object({
    username: z.string().min(1, { message: "Name is required" }),
    password: z.string().min(6, { message: "Password is required" }),
    email: z.string().email({ message: "Email is required" }),
});

export const LoginUserSchema = z.object({
    username: z.string().min(1, { message: "Name is required" }),
    password: z.string().min(6, { message: "Password is required" }),
});

export const CreateRoomSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
});