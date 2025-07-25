import httpStatus from 'http-status-codes';
import AppError from "../../errorHandlers/AppError";
import { User } from "../user/user.model";
import { Booking_Status, IBooking } from "./booking.interface";
import { Booking } from './booking.model';
import { Payment } from '../payment/payment.model';
import { PAYMENT_STATUS } from '../payment/payment.interface';
import { Tour } from '../tour/tour.model';

const getTransactionId = () =>{
    return `tran_${Date.now()}_${Math.floor(Math.random()* 1000)}`
}
const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId()

    const user = await User.findById(userId)

    if(!user?.phone || !user.address){
        throw new AppError(httpStatus.BAD_REQUEST, "Please Update Your Profile to Book a Tour.")
    }

    const tour = await Tour.findById(payload.tour).select("costFrom")

    if(!tour?.costFrom){
        throw new AppError(httpStatus.BAD_REQUEST, "No Tour Cost Found")
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const amount = Number(tour.costFrom) * Number(payload.guestCount!)

    const booking = await Booking.create({
        user: userId,
        status: Booking_Status.PENDING,
        ...payload
    })

    const payment = await Payment.create({
        booking: booking._id,
        status: PAYMENT_STATUS.UNPAID,
        transactionId: transactionId,
        amount: amount
    })

    const updatedBooking = await Booking
        .findByIdAndUpdate(
            booking._id, 
            {payment: payment._id},
            {new: true, runValidators: true}
        )
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment") // user, tour, payment is field name

    return updatedBooking

};

const getUserBookings = async () => {

    return {}
};

const getBookingById = async () => {
    return {}
};

const updateBookingStatus = async (

) => {

    return {}
};

const getAllBookings = async () => {

    return {}
};

export const BookingService = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    getAllBookings,
};