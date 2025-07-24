// User - Booking(Pending) -> Payment (Unpaid) -> SSLCommerz -> Booking_update = Confirm -> Payment update = Paid

import { Types } from "mongoose";

export enum Booking_Status{
    PENDING = "PENDING",
    CANCEL = "CANCEL",
    COMPLETE = "COMPLETE",
    FAILED = "FAILED"
}

export interface IBooking{
    user: Types.ObjectId,
    tour: Types.ObjectId,
    payment?: Types.ObjectId,
    guestCount: number,
    status: Booking_Status
}