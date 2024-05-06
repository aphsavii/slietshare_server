import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    regno: {
      type: Number,
      required: [true, "Regno is required"],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    programme: {
      type: String,
      required: [true, "Programme is required"],
      trim: true,
    },
    batch: {
      type: Number,
      required: [true, "Batch is required"],
    },
    trade: {
      type: String,
      required: true,
      trim: [true, "Trade is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      default: "user",
    },
    refreshToken: {
      type: String,
    },
    avatarUrl:{
      type:String,
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken =async function(){
   return jwt.sign({_id:this._id}, process.env.JWT_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({_id:this._id}, process.env.JWT_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY});
}

userSchema.methods.generateAccessAndRefreshToken =async function(){
  const accessToken = await this.generateAccessToken();
  const refreshToken = await this.generateRefreshToken();
  return {accessToken, refreshToken};
}

const User = mongoose.model("User", userSchema);
export { User };
