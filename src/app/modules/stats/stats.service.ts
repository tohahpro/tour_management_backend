import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";


const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const sixtyDaysAgo = new Date(now).setDate(now.getDate() - 60);
const ninetyDaysAgo = new Date(now).setDate(now.getDate() - 90);

const getUserStats = async () => {
    // step-1 total available user 
    const totalUsersPromise = User.countDocuments();
    // total active user
    const totalActiveUsersPromise = User.countDocuments({ isActive: IsActive.ACTIVE });
    // total inactive user
    const totalInactiveUsersPromise = User.countDocuments({ isActive: IsActive.INACTIVE });
    // total Blocked user
    const totalBlockedUsersPromise = User.countDocuments({ isBlocked: IsActive.BLOCKED });

    // --------- New Users --------- //
    const newUsersLast7DaysPromise = User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    })
    const newUsersLast30DaysPromise = User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    })
    const newUsersLast60DaysPromise = User.countDocuments({
        createdAt: { $gte: sixtyDaysAgo }
    })
    const newUsersLast90DaysPromise = User.countDocuments({
        createdAt: { $gte: ninetyDaysAgo }
    })

    // ------- Role base total users --------- //

    const usersByRolePromise = User.aggregate([
        // stage-1 : Grouping users by role.
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }
    ])

    // all promise await call
    const [
        totalUsers, activeUsers, inactiveUsers,
        blockedUsers, newUsersLast7Days, newUsersLast30Days,
        newUsersLast60Days, newUsersLast90Days, usersByRole
    ] = await Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInactiveUsersPromise,
        totalBlockedUsersPromise,
        newUsersLast7DaysPromise,
        newUsersLast30DaysPromise,
        newUsersLast60DaysPromise,
        newUsersLast90DaysPromise,
        usersByRolePromise
    ])

    return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        blockedUsers,
        newUsersLast7Days,
        newUsersLast30Days,
        newUsersLast60Days,
        newUsersLast90Days,
        usersByRole
    }
}

const getTourStats = async () => {
    const totalToursPromise = Tour.countDocuments();

    // stage-1 : Connect Tour Type Model - lookup stage
    const totalTourByTourTypePromise = Tour.aggregate([
        {
            $lookup: {
                from: "tourtypes",
                localField: "tourType",
                foreignField: "_id",
                as: "type"
            }
        },
        // stage-2 : Unwind the type convert array to object
        {
            $unwind: "$type"
        },
        // stage-3 : Grouping by tour type
        {
            $group: {
                _id: "$type.name",
                count: { $sum: 1 }
            }
        }
    ]);

    const avgTourCostPromise = Tour.aggregate([
        // stage-1: Group the cost from, do sum, and average the sum
        {
            $group: {
                _id: null,
                avgCostFrom: { $avg: "$costFrom" }
            }
        }
    ])


    // stage-1 : Connect Division Model - lookup stage
    const totalTourByDivisionPromise = Tour.aggregate([
        {
            $lookup: {
                from: "divisions",
                localField: "division",
                foreignField: "_id",
                as: "division"
            }
        },
        // stage-2 : Unwind the Division convert array to object
        {
            $unwind: "$division"
        },
        // stage-3 : Grouping by Division
        {
            $group: {
                _id: "$division.name",
                count: { $sum: 1 }
            }
        }
    ]);

    const totalHighestBookedTourPromise = Booking.aggregate([
        // stage-1 : Group the tour
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 }
            }
        },
        // stage-2 : Sort the tour
        {
            $sort: { bookingCount: -1 }
        },
        // stage-3 : limit
        {
            $limit: 5
        },
        // stage-4 : lookup
        {
            $lookup: {
                from: "tours",
                // localField: "tour",
                let: { tourId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$tourId"] }
                        }
                    }
                ],
                as: "tour"
            }
        },
        // stage-5 unwind stage
        {
            $unwind: "$tour"
        },
        // stage-6 : Project stage
        {
            $project: {
                bookingCount: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }

    ])

    const [
        totalTours, totalTourByTourType,
        avgTourCost, totalTourByDivision,
        totalHighestBookedTour

    ] = await Promise.all([
        totalToursPromise,
        totalTourByTourTypePromise,
        avgTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestBookedTourPromise
    ])

    return {
        totalTours,
        totalTourByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHighestBookedTour
    }
};

const getBookingStats = async () => {
    const totalBookingPromise = Booking.countDocuments();

    const totalBookingByStatusPromise = Booking.aggregate([
        //stage-1
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ])

    const bookingPerTourPromise = Booking.aggregate([
        // stage-1 group stage
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 }
            }
        },
        // stage-2 sort stage
        {
            $sort: { bookingCount: -1 }
        },

        //stage-3 limit stage
        {
            $limit: 10
        },
        // stage-4 lookup stage
        {
            $lookup: {
                from: "tours",
                localField: "_id",
                foreignField: "_id",
                as: "tour"
            }
        },
        // stage-5 unwind 
        {
            $unwind: "$tour"
        },
        // stage-6 project stage
        {
            $project: {
                bookingCount: 1,
                _id: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ])

    const avgGuestCountPerBookingPromise = Booking.aggregate([
        // stage-1 group stage
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: "$guestCount" }
            }
        }
    ])

    const bookingsLast7DaysPromise = Booking.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    })
    const bookingsLast30DaysPromise = Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    })
    const bookingsLast60DaysPromise = Booking.countDocuments({
        createdAt: { $gte: sixtyDaysAgo }
    })
    const bookingsLast90DaysPromise = Booking.countDocuments({
        createdAt: { $gte: ninetyDaysAgo }
    })

    const totalBookingByUniqueUsersPromise = Booking.distinct("user").then((user) => user.length)


    const [
        totalBooking, totalBookingByStatus,
        bookingPerTour,
        avgGuestCountPerBooking,
        bookingsLast7Days,
        bookingsLast30Days,
        bookingsLast60Days,
        bookingsLast90Days,
        totalBookingByUniqueUsers


    ] = await Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingPerTourPromise,
        avgGuestCountPerBookingPromise,
        bookingsLast7DaysPromise,
        bookingsLast30DaysPromise,
        bookingsLast60DaysPromise,
        bookingsLast90DaysPromise,
        totalBookingByUniqueUsersPromise

    ])

    return {
        totalBooking,
        totalBookingByStatus,
        bookingPerTour,
        avgGuestCountPerBooking: avgGuestCountPerBooking[0].avgGuestCount,
        bookingsLast7Days,
        bookingsLast30Days,
        bookingsLast60Days,
        bookingsLast90Days,
        totalBookingByUniqueUsers
    }
}

const getPaymentStats = async () => {
    const totalPaymentsPromise = Payment.countDocuments();

    const totalPaymentByStatusPromise = Payment.aggregate([
        //stage 1 group
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ])

    const totalRevenuePromise = Payment.aggregate([
        //stage1 match stage
        {
            $match: { status: PAYMENT_STATUS.PAID }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" }
            }
        }
    ])


    const avgPaymentAmountPromise = Payment.aggregate([
        // stage-1 
        {
            $group : {
                _id : null,
                avgPaymentAmount : { $avg: "$amount" }
            }
        }
    ])

    const paymentGatewayDataPromise = Payment.aggregate([
        // stage-1 group stage 
        {
            $group : {
                _id : { $ifNull : ["$paymentGatewayData.status", "UNKNOWN"]},
                count : { $sum: 1 }
            }
        }
    ])

    const [
        totalPayments,
        totalPaymentByStatus,
        totalRevenue,
        avgPaymentAmount,
        paymentGatewayData
    ] = await Promise.all([
        totalPaymentsPromise,
        totalPaymentByStatusPromise,
        totalRevenuePromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise
    ])

    return {
        totalPayments,
        totalPaymentByStatus,
        totalRevenue,
        avgPaymentAmount,
        paymentGatewayData
    }
}



export const StatsService = {
    getBookingStats,
    getPaymentStats,
    getTourStats,
    getUserStats
}