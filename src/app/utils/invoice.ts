/* eslint-disable @typescript-eslint/no-explicit-any */
import  PDFDocument  from 'pdfkit';
import AppError from "../errorHandlers/AppError";


export interface InvoiceData{
    transactionId: string,
    bookingDate: Date,
    userName: string,
    tourTitle: string;
    guestCount: number;
    totalAmount: number;

}

export const generatePDF = async(invoiceData: InvoiceData)=>{
    try {
        return new Promise((resolve, reject)=>{
            const doc = new PDFDocument({size: "A4", margin: 50})
            const buffer: Uint8Array[] = []

            doc.on("data", (chunk)=> buffer.push(chunk))
            doc.on("end", ()=> resolve(Buffer.concat(buffer)))
            doc.on("error", (err)=> reject(err))

            // pdf content
            doc.fontSize(20).text("Invoice", { align: "center" })
            doc.moveDown()
            doc.fontSize(14).text(`Transaction ID: ${invoiceData.transactionId}`)
            doc.fontSize(14).text(`Booking Date : ${invoiceData.bookingDate}`)
            doc.fontSize(14).text(`Customer : ${invoiceData.userName}`)
            
            doc.moveDown()

            doc.text(`Tour: ${invoiceData.tourTitle}`);
            doc.text(`Guests: ${invoiceData.guestCount}`);
            doc.text(`Total Amount: $${invoiceData.totalAmount.toFixed(2)}`);
            doc.moveDown();

            doc.text("Thank you for booking with us!", { align: "center" });
            doc.end()
        })
        
    } catch (error: any) {
        console.log(error);
        throw new AppError(401, `PDF creation error ${error.message}`)
    }
}