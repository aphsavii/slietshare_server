import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    content:{
        type:String,
        required:[true,"Content is required"],
        maxlength:280
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    views:{
        type:Number,
        default:0,
    },
},
{
    timestamps:true,
}
)