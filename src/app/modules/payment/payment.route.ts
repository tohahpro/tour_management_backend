import express from "express";
import { PaymentController } from "./payment.controller";


const router = express.Router();

router.post('/success', PaymentController.successPayment);
// router.post('/payment/fail', PaymentController.failPayment);
// router.post('/payment/cancel', PaymentController.cancelPayment);

export const PaymentRoutes = router;