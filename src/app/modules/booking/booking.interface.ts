// User - Booking(Pending) -> Payment (Unpaid) -> SSLCommerz -> Booking_update = Confirm -> Payment update = Paid

import { Types } from "mongoose";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";

export enum Booking_Status{
    PENDING = "PENDING",
    CANCEL = "CANCEL",
    COMPLETE = "COMPLETE",
    FAILED = "FAILED"
}

export interface IBooking{
    user: Types.ObjectId | IUser,
    tour: Types.ObjectId | ITour,
    payment?: Types.ObjectId,
    guestCount: number,
    status: Booking_Status,
    createdAt?: Date,
}