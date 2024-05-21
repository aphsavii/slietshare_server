import { sendMail } from "./sendMail.js";
import { reminderFormat } from "./reminderFormat.js";
import { dbConnect } from "../../connections/dbConnect.js";
import { User } from "../../models/user.model.js";

dbConnect().then(
    async ()=>{
        // const users = [
        //     {
        //         name:"Avinash",
        //         email:"2331080@sliet.ac.in"
        //     },
        //     {
        //         name:"Avinash kumar",
        //         email:"2010215@sliet.ac.in"
        //     },
        //     {
        //         name:"vishal",
        //         email:"aphsavii@gmail.com"
        //     }
        // ]
    let usersArray = [];

      await User.find({}, { email: 1, fullName: 1, _id: 0 })
        .then(users => {
          const userArray = users.map(user => ({
            email: user.email,
            fullName: user.fullName
          }));
            usersArray = userArray;
        })
        .catch(err => {
          console.error(err);
        });

        console.log(usersArray);
        
        usersArray.forEach(async (user)=>{
            const format = reminderFormat(user.fullName);
            await sendMail(user.email,"Reminder!!!",format);
        })
    }
).catch((e)=>{
    console.log(e);
})
