import sharp from "sharp";
import fs from "fs";

const convertToWebp = async (localUrl, quality) => {
  const webpUrl = `${localUrl.split(".")[0]}.webp`;
  try {
    await sharp(localUrl).webp({ quality: quality }).toFile(webpUrl);
    fs.unlinkSync(localUrl);
  } catch (error) {
    console.log(error);
    return null;
  }
  return webpUrl;
};

export { convertToWebp };
