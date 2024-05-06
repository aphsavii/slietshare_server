import mongoose from "mongoose";

const dbUrl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

const dbConnect = async () => {
  try {
    // DB CONNECTION
    const connectionInstance = await mongoose.connect(dbUrl);
    console.log("Connected to database on url ", dbUrl);
  } catch (error) {
    console.log("Error connecting to database", error);
  }
};

export { dbConnect };
