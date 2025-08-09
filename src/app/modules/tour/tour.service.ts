import { tourSearchFields, tourTypeSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";
import { QueryBuilder } from "../../utils/QueryBuilder";




const createTour = async (payload: ITour) => {
    const existingTour = await Tour.findOne({ title: payload.title });
    if (existingTour) {
        throw new Error("A tour with this title already exists.");
    }

    const tour = await Tour.create(payload);

    return tour;
};

const updateTour = async (id: string, payload: Partial<ITour>) => {
    const existingTour = await Tour.findById(id);
    if (!existingTour) {
        throw new Error("Tour not found.");
    }

    if(payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0){
        payload.images = [...payload.images, ...existingTour.images]
    }

    const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });

    return updatedTour
};

const getAllTours = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Tour.find(), query)

    const tours = await queryBuilder
        .search(tourSearchFields)
        .filter()
        .sort()
        .fields()
        .pagination()

    // const meta = await queryBuilder.getMeta()
    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])    

    return {
        data, meta
    }
}

// const getAllTours = async(query: Record<string, string>)=>{
//     const filter = query
//     const searchTerm = query.searchTerm || '';    
//     const sort = query.sort || "" 
//     const page = Number(query.page) || 1
//     const limit = Number(query.limit) || 10
//     const skip = (page - 1) * limit

//     const selectedFields = query.fields?.split(",").join(" ") || ""   // new selectedFields=> title location

//     for(const field of excludeField){
//         // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
//         delete filter[field]
//     }
//     const searchQuery = {
//         $or: tourSearchFields.map(field =>({[field]: {$regex: searchTerm, $options: "i"}}))
//     }

//     // const tours = await Tour.find(searchQuery).find(filter).sort(sort).select(selectedFields).skip(skip).limit(limit);

//     const filterQuery = Tour.find(filter)
//     const tours = filterQuery.find(searchQuery)
//     const allTours = await tours.sort(sort).select(selectedFields).skip(skip).limit(limit)

//     const totalTours = await Tour.countDocuments();

//     const totalPage = Math.ceil(totalTours/limit)

//     const meta={
//         page: page,
//         total: totalTours,
//         totalPage: totalPage,
//         limit: limit
//     }

//     return{
//         data: allTours,
//         meta: meta
//     }
// }


const deleteTour = async (id: string) => {
    return await Tour.findByIdAndDelete(id);
};

const createTourType = async (payload: ITourType) => {
    const existingTourType = await TourType.findOne({ name: payload.name });

    if (existingTourType) {
        throw new Error("Tour type already exists.");
    }

    return await TourType.create({ name: payload.name });
};

const getAllTourTypes = async (query: Record<string, string>) => {
    // return await TourType.find();
    const queryBuilder = new QueryBuilder(TourType.find(), query)

    const tours = await queryBuilder
        .search(tourTypeSearchableFields)
        .filter()
        .sort()
        .fields()
        .pagination()

    const [data, meta]= await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])

    return {data, meta}
};

const getSingleTourType = async (id: string) => {
    const tourType = await TourType.findById(id);
    return {
        data: tourType
    };
};

const updateTourType = async (id: string, payload: ITourType) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }

    const updatedTourType = await TourType.findByIdAndUpdate(id, payload, { new: true });
    return updatedTourType;
};

const deleteTourType = async (id: string) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }

    return await TourType.findByIdAndDelete(id);
};


export const TourService = {
    createTour,
    createTourType,
    deleteTourType,
    updateTourType,
    getAllTourTypes,
    getAllTours,
    getSingleTourType,
    updateTour,
    deleteTour,
};