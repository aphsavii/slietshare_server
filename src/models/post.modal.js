import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    mediaUrl:[String],
    tags: {
        type: [String],
        required: [true, "Tags are required"],
    },
    views: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

const Post = mongoose.model("Post", postSchema);

export default Post;