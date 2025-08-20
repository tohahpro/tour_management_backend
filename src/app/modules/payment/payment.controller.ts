import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.services";
import { envVars } from "../../config/env";
import { sendResponse } from "../../utils/sendResponse";



const successPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query
  const result = await PaymentService.successPayment(query as Record<string, string>)

  if(result.success){
    res.redirect(`${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
  }
});

const initPayment = catchAsync(async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId;
    const result = await PaymentService.initPayment(bookingId as string)

    sendResponse(res,{
      statusCode: 201,
      success: true,
      message: "Payment done Successfully",
      data: result
    })
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await PaymentService.failPayment(query as Record<string, string>)

    if (!result.success) {
        res.redirect(`${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }
});
const cancelPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await PaymentService.cancelPayment(query as Record<string, string>)

    if (!result.success) {
        res.redirect(`${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }
});

const getInvoiceDownloadUrl = catchAsync(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const result = await PaymentService.getInvoiceDownloadUrl(paymentId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Invoice download URL retrieved successfully",
        data: result
    });
});

export const PaymentController = {
  successPayment,
  failPayment,
  cancelPayment,
  initPayment,
  getInvoiceDownloadUrl,
};