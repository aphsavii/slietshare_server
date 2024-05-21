const reminderFormat = (name) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <title>Reminder to Upload Question Papers</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
       </head>
       <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 12px;">
          <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 40px; background: #f4f7ff; background-image: url('https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner'); background-repeat: no-repeat; background-size: 800px 452px; background-position: top center; font-size: 12px; color: #434343;">
             <header>
                <table style="width: 100%;">
                   <tbody>
                      <tr style="height: 0;">
                         <td></td>
                         <td style="text-align: right;">
                            <span style="font-size: 12px; line-height: 30px; color: #ffffff;">${new Date().toDateString()}</span>
                         </td>
                      </tr>
                   </tbody>
                </table>
             </header>
             <main>
                <div style="margin: 0; margin-top: 70px; padding: 42px 30px 65px; background: #ffffff; border-radius: 30px;">
                   <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                      <h1 style="margin: 0; font-size: 20px; font-weight: 500; color: #1f1f1f; text-align: center;">Reminder to Upload Question Papers</h1>
                      <p style="margin: 0; margin-top: 17px; font-size: 14px; font-weight: 500;">
                         Hey ${name.split(' ')[0]},
                      </p>
                      <p style="margin: 0; margin-top: 17px; font-weight: 400; letter-spacing: 0.56px;">
                         We hope this message finds you well and prepared for your upcoming examinations.
                         <br>
                         As a valued member of our <a href="https://slietshare.online" style="color: #0073b1; text-decoration: none;">slietshare.online</a> community, we are writing to remind you to upload your question papers after each of your exams. Sharing these resources helps fellow students prepare better and contributes to our collective academic success.
                      </p>
                      <p style="margin: 0; margin-top: 17px; font-weight: 400; letter-spacing: 0.56px;">
                         Here are a few steps to ensure a smooth upload process:
                      </p>
                      <ul style="margin-top: 15px; padding-left: 20px;">
                         <li>Scan or take a clear picture of the question paper.</li>
                         <li>Log in to your account on slietshare.online.</li>
                         <li>Navigate to the upload section and select the relevant course and subject.</li>
                         <li>Upload the question paper and provide any additional details if necessary.</li>
                      </ul>
                      <p style="margin: 0; margin-top: 30px; font-weight: 400; font-size:12px">
                         We also want to take this opportunity to wish you the very best of luck in your examinations. We're confident that your hard work and dedication will pay off.
                      </p>
                      <p style="margin: 0; margin-top: 30px; font-weight: 400; font-size:12px;">
                         Best regards,
                         <br>
                         Avinash from slietshare community
                      </p>
                      <p style="margin: 0; margin-top: 40px; text-align: center;">
                         <a href="https://slietshare.online" target="_blank">
                         <button style="padding: 10px 20px; color: #fff; background: #3788d8; font-weight: 600; border: none; outline: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                         Take me there
                         </button>
                         </a>
                      </p>
                   </div>
                </div>
                <p style="max-width: 400px; margin: 0 auto; margin-top: 50px; text-align: center; font-weight: 500; color: #8c8c8c;">
                   Need help? Ask at
                   <a href="mailto:info@slietshare.online" style="color: #499fb6; text-decoration: none;">info@slietshare.online</a>
                </p>
             </main>
             <footer style="width: 100%; max-width: 490px; margin: 20px auto 0; text-align: center; border-top: 1px solid #e6ebf1;">
                <p style="margin: 0; margin-top: 40px; font-size: 16px; font-weight: 600; color: #434343;">
                   SLIETshare
                </p>
                <p style="margin: 0; margin-top: 8px; color: #434343;">
                   SLIET Longowal, Sangrur, Punjab.
                </p>
                <p style="margin: 0; margin-top: 16px; color: #434343;">
                   Copyright © 2024 SLIETshare. All rights reserved.
                </p>
             </footer>
          </div>
       </body>
    </html>    `;
}

export {reminderFormat};