import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';          
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(localFilePath,folderPath){
  try {
    if (!localFilePath)   return null;
    const result = await cloudinary.uploader.upload(localFilePath,{resource_type: "image", folder: folderPath});
    fs.unlinkSync(localFilePath); 
    return result.url;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath);
    return null;
  }
}

async function deleteFromCloudinary(publicUrl){
  const publicId = publicUrl.split("/").slice(-2)[0].split(".")[0]+"/"+publicUrl.split("/").slice(-1)[0].split(".")[0];
  try {
    if (!publicId)   return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}


export {uploadOnCloudinary,deleteFromCloudinary};