import { Type } from '@sinclair/typebox';

export const courseSchema = Type.Object({
    deliveryAddress: Type.String(),
    paymentTermsInDays: Type.Number(),
    countryId: Type.Number(),
    productId: Type.Integer(),
    userId: Type.Integer(),
})

export const courseListSchema = Type.Array(courseSchema);
