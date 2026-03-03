import { Static, Type } from "@sinclair/typebox";

export const userSchema = Type.Object({
  id: Type.Number(),
  googleId: Type.String(),
});

export const urlSchema = Type.String();

export const callbackSchema = Type.Null();

export const authSchema = Type.Boolean();

export type UserDTO = Static<typeof userSchema>;
