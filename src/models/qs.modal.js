import mongoose,{Schema} from "mongoose";
import { deleteFromCloudinary } from "../utils/uploadOnCloudinary.js";
const qsSchecma = new mongoose.Schema(
{
    subCode:{
        type: String,
        required: [true, "Subject Code is required"],
        index: true,
    },
    subName:{
        type: String,
        required: [true, "Subject Name is required"],
        trim: true,
    },
    programme:{
        type: String,
        required:[true,"Programme is required"]
    },
    trade:{
        type: String,
        required: [true, "Trade is required"],
        trim: true,
    },
    sem:{
        type: Number,
        required: true,
    },
    DOE:{
        type: String,
        required: [true, "Date of Exam is required"],
    },
    type:{
        type:String,
        required: [true, "Type is required (minor-1/ minor-2/ major)"],
        enum:["minor-1","minor-2","major"],
    },
    status:{
        type: String ,
        enum: ["pending", "approved"],
        default: "approved",
    },
    qsUrl:{
        type: String,
        required: [true, "File is required"],
    },
    uploadedBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},
{ timestamps: true }
);

qsSchecma.pre("deleteOne", async function (next) {
    const file = deleteFromCloudinary(this.fileUrl);
    if(!file) return next();
    next();
});

const Qs = mongoose.model("Qs", qsSchecma);

export { Qs};