

//welcome 

// otp for 2fa 

// reset password token 

// confirmation of other and sending tracking number 

// when an order is completed 
import { Injectable } from '@nestjs/common';
import { MailerService } from "@nestjs-modules/mailer";



    @Injectable()
    export class Mailer {
        constructor(private readonly mailerservice:MailerService){}
        async SendVerificationeMail(email:string,name:string):Promise<void>{
          const subject = "Welcome To IdeaBox";
      const content = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Verification - Verification Linke</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            color: #333333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 10px;
          }
          .verification-heading {
            text-align: center;
            color: #43215b;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .message {
            text-align: center;
            font-size: 16px;
            margin-bottom: 20px;
          }
          .otp {
            text-align: center;
            font-size: 30px;
            color: #43215b;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .instructions {
            font-size: 16px;
            line-height: 1.4;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #43215b;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #777777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>IDEABOX</h1>
          </div>
          <h1 class="verification-heading">Dear, ${name}!</h1>
          <p class="message">Welcome To IDEABOX:</p>
          
    
         
          <div class="instructions">
            <p>
            Welcome aboard to IdeaBox! We're thrilled to have you join our innovative community of idea creators, thinkers, and doers.  .
            </p>      
           
            <p>
            At IdeaBox, we believe that great ideas have the power to change the world. Whether you're a seasoned entrepreneur, a creative thinker, or someone with a passion for problem-solving, IdeaBox is your platform to explore, develop, and share your ideas with the world.
            </p>
            <p>We're excited to see the amazing ideas you'll bring to IdeaBox and the positive impact they'll have. Remember, no idea is too big or too small—every idea has the potential to make a difference </p>
            <p>
              For any questions or assistance, contact our support team at <a class="button" href="mailto:nedunestjs@gmail.com">support@ideabox.com</a>
            </p>
          </div>
          <p class="footer">IDEABOX <br> powered by inieqr</p>
        </div>
      </body>
      </html>
      
      `;
    
    
          await this.mailerservice.sendMail({to:email,subject,html:content })
          
      }
    
    
        
        async SendPasswordResetLinkMail(email:string, resetlink: string, name:string):Promise<void>{
          const subject = "Password Reset Token";
          const content = `<!DOCTYPE html>
      <html>
        <head>
          <title>Forgot Password Reset Token</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f2f2f2;
              color: #333333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .logo {
              text-align: center;
              margin-bottom: 10px;
            }
            .verification-heading {
              text-align: center;
              color: #43215b;
              font-size: 20px;
              margin-bottom: 10px;
            }
            .message {
              text-align: center;
              font-size: 16px;
              margin-bottom: 20px;
            }
            .otp {
              text-align: center;
              font-size: 30px;
              color: #43215b;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .instructions {
              font-size: 16px;
              line-height: 1.4;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #43215b;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #777777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
            <h1> IDEABOX </h1>
            </div>
              
            <h1 class="verification-heading">Password Reset Token</h1>
            <p class="message"><span class="username">HI ${name}</span>,</p>
            <p class="otp">Your Password Reset Token : <span class="otp-code">${resetlink}</span></p>
            <div class="instructions">
              <p>
                We are sorry you couldn't get access into IDEABOX, an Idea collection platform. Please use the Reset Token  provided above to enter a new password.
              </p>
              <p>
                The password reset token is valid for a limited time, and it should be used to complete the password reset process.
              </p>
              <p>
                If you did not request this reset link, please ignore this email. Your account will remain secure.
              </p>
              <p >
              For any questions or assistance, contact our support team at <a class="button" href="mailto:nedunestjs@gmail.com">support@ideabox.com</a>
              </p>
            </div>
            <p class="footer">IDEABOX  <br> powered by inieqr</p>
          </div>
        </body>
      </html>
      `;
    
          await this.mailerservice.sendMail({to:email,subject,html:content })
          
      }
    }