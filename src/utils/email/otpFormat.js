const otpFormat = (otp,name) =>{
    const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Static Template</title>
    
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style="
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background: #ffffff;
          font-size: 14px;
        "
      >
        <div
          style="
            max-width: 680px;
            margin: 0 auto;
            padding: 45px 30px 60px;
            background: #f4f7ff;
            background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
            background-repeat: no-repeat;
            background-size: 800px 452px;
            background-position: top center;
            font-size: 14px;
            color: #434343;
          "
        >
          <header>
            <table style="width: 100%;">
              <tbody>
                <tr style="height: 0;">
                  <td>
                  </td>
                  <td style="text-align: right;">
                    <span
                      style="font-size: 12px; line-height: 30px; color: #ffffff;"
                      >${new Date().toDateString()}</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </header>
    
          <main>
            <div
              style="
                margin: 0;
                margin-top: 70px;
                padding: 92px 30px 115px;
                background: #ffffff;
                border-radius: 30px;
                text-align: center;
              "
            >
              <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                <h1
                  style="
                    margin: 0;
                    font-size: 24px;
                    font-weight: 500;
                    color: #1f1f1f;
                  "
                >
                  Your OTP
                </h1>
                <p
                  style="
                    margin: 0;
                    margin-top: 17px;
                    font-size: 16px;
                    font-weight: 500;
                  "
                >
                  Hey ${name},
                </p>
                <p
                  style="
                    margin: 0;
                    margin-top: 17px;
                    font-weight: 500;
                    letter-spacing: 0.56px;
                  "
                >
                     Use the following OTP
                  to complete the procedure of registration. OTP is
                  valid for
                  <span style="font-weight: 600; color: #1f1f1f;">2 minutes</span>.
                  Do not share this code with others.
                </p>
                <p
                  style="
                    margin: 0;
                    margin-top: 60px;
                    font-size: 30px;
                    font-weight: 600;
                    letter-spacing: 10px;
                    color: #0073b1;
                  "
                >
                  ${otp}
                </p>
              </div>
            </div>
    
            <p
              style="
                max-width: 400px;
                margin: 0 auto;
                margin-top: 90px;
                text-align: center;
                font-weight: 500;
                color: #8c8c8c;
              "
            >
              Need help? Ask at
              <a
                href="mailto:contact@slietshare.online"
                style="color: #499fb6; text-decoration: none;"
                >contact@slietshare.online</a
              >
          </main>
    
          <footer
            style="
              width: 100%;
              max-width: 490px;
              margin: 20px auto 0;
              text-align: center;
              border-top: 1px solid #e6ebf1;
            "
          >
            <p
              style="
                margin: 0;
                margin-top: 40px;
                font-size: 16px;
                font-weight: 600;
                color: #434343;
              "
            >
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
    </html>
    `;
    return html;
}

export { otpFormat}