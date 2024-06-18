import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

const Follow = mongoose.model("Follow", followSchema);

export default Follow;