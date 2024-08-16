import axios from "axios";
import {parseFromString} from 'dom-parser';

const scrape = async (link) => {
   const res = await axios.get(link);
   console.log(res.data);
    const doc = parseFromString(data, "text/html");
    return doc;
};


scrape('https://codeforces.com/profile/aphs_avii');
export default scrape;