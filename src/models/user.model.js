import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const workExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, "Company name is required"],
  },
  position: {
    type: String,
    required: [true, "Position is required"],
  },
  startDate: {
    type: String,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: String,
    required: [true, "End date is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
});

const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: [true, "Degree is required"],
  },
  institute: {
    type: String,
    required: [true, "Institute is required"],
  },
  startDate: {
    type: String,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: String,
    required: [true, "End date is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  link: {
    type: String,
    required: [true, "Link is required"],
  },
});

const skillSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: [true, "Skill is required"],
  },
  proficiency: {
    type: String,
    required: [true, "Proficiency is required"],
    enum: ["Beginner", "Intermediate", "Advanced"]
  },
});

const socialLinksSchema = new mongoose.Schema({
  hackerrank:{
    type:String,
  },
  linkedin:{
    type:String,
  },
  github:{
    type:String,
  },
  codeforces:{
    type:String,
  },
  medium:{
    type:String,
  },
  leetcode:{
    type:String,
  },
  portfolio:{
    type:String,
  },
  interviewbit:{
    type:String,
  },
  codechef:{
    type:String,
  },
  stackoverflow:{
    type:String,
  },
  gfg:{
    type:String,
  }
});


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
    },
    bio: {
      type: String,
    },
    resumeUrl: {
      type: String,
    },
    homeTown: {
      type: String,
    },
    workExperience: [workExperienceSchema],
    education: [educationSchema],
    projects: [projectSchema],
    skills: [skillSchema],
    socialLinks: socialLinksSchema,
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
