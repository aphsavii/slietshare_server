import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    mediaUrl:[String],
    tags: {
        type: [String],
    },
    status:{
        type:String,
        enum:["active","archeived"],
        default:"active"
    },
    share:{
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
},
{
    timestamps: true,
}
);

const Post = mongoose.model("Post", postSchema);

export default Post;