/* eslint-disable @typescript-eslint/no-explicit-any */
import { Booking_Status } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";


const successPayment = async (query: Record<string, string>) => {
  // Update Booking Status to Confirm
  // Update Payment Status to PAID
  const session = await Booking.startSession()
    session.startTransaction()

    try {
        const updatedPayment = await Payment.findOneAndUpdate({transactionId : query.transactionId},{
            status: PAYMENT_STATUS.PAID,

        },{ new: true, runValidators: true, session })

        await Booking.findByIdAndUpdate(
                updatedPayment?.booking,
                { status: Booking_Status.COMPLETE },
                { new: true, runValidators: true, session }
            )
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment") // user, tour, payment is field name
        
       
        await session.commitTransaction(); // transaction
        session.endSession()
        return {
            success: true,
            message: "Payment Completed Successfully"
        }
    } 
    catch (error: any) {
        await session.abortTransaction() // rollback
        session.endSession()
        throw error

    }
};

const failPayment = async () => {
  // Update Booking Status to FAIL
  // Update Payment Status to FAIL
};

const cancelPayment = async () => {
  // Update Booking Status to CANCEL
  // Update Payment Status to CANCEL
};

export const PaymentService = {
  successPayment,
  failPayment,
  cancelPayment
};

