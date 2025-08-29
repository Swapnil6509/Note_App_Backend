const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP Email with HTML Template
 * @param {string} email - Recipient email address
 * @param {string} otp - One Time Password
 */
async function sendOTP(email, otp) {
  try {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); line-height: 1.6;">
        
        <!-- Main Container -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 60px 20px;">
            <tr>
                <td align="center">
                    
                    <!-- Email Content Container -->
                    <table role="presentation" style="max-width: 520px; width: 100%; border-collapse: collapse; background-color: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.8);">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #367aff 0%, #2563eb 100%); padding: 50px 40px 40px 40px; text-align: center;">
                                <div style="width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                                    <div style="width: 24px; height: 24px; border: 3px solid white; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                                </div>
                                <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                    Verification Code
                                </h1>
                                <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                                    Secure access to your account
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 50px 40px;">
                                
                                <!-- Greeting -->
                                <p style="margin: 0 0 28px 0; color: #1e293b; font-size: 18px; font-weight: 500;">
                                    Hello there! 👋
                                </p>
                                
                                <!-- Message -->
                                <p style="margin: 0 0 40px 0; color: #475569; font-size: 16px; line-height: 1.7;">
                                    We've received a request to verify your account. Enter the code below to complete your authentication securely.
                                </p>
                                
                                <!-- OTP Code Container -->
                                <div style="text-align: center; margin: 40px 0;">
                                    <div style="display: inline-block; background: linear-gradient(135deg, rgba(54, 122, 255, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%); border: 2px solid #367aff; border-radius: 16px; padding: 32px 40px; position: relative; backdrop-filter: blur(10px);">
                                        <div style="position: absolute; top: -1px; left: -1px; right: -1px; bottom: -1px; background: linear-gradient(135deg, #367aff, #2563eb); border-radius: 16px; opacity: 0.1; z-index: -1;"></div>
                                        <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                            Your Code
                                        </p>
                                        <div style="font-size: 42px; font-weight: 800; color: #367aff; letter-spacing: 12px; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; text-shadow: 0 2px 4px rgba(54, 122, 255, 0.2);">
                                            ${otp}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Instructions -->
                                <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 40px 0;">
                                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                                        <div style="width: 20px; height: 20px; background: #367aff; border-radius: 50%; margin-right: 12px; display: flex; align-items: center; justify-content: center;">
                                            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
                                        </div>
                                        <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                                            Security Guidelines
                                        </p>
                                    </div>
                                    <ul style="margin: 0; padding-left: 32px; color: #64748b; font-size: 15px; line-height: 1.6;">
                                        <li style="margin-bottom: 8px;">Code expires in 10 minutes</li>
                                        <li style="margin-bottom: 8px;">Single-use verification only</li>
                                        <li>Keep this code confidential</li>
                                    </ul>
                                </div>
                                
                                <!-- Security Notice -->
                                <div style="border-left: 4px solid #367aff; background: rgba(54, 122, 255, 0.02); padding: 20px 24px; border-radius: 0 8px 8px 0; margin: 40px 0 0 0;">
                                    <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                                        <strong style="color: #1e293b;">Didn't request this?</strong> You can safely ignore this email. If you have security concerns, please contact our support team immediately.
                                    </p>
                                </div>
                                
                            </td>
                        </tr>
                        
                    </table>
                    
                </td>
            </tr>
        </table>
        
    </body>
    </html>`;

    await transporter.sendMail({
      from: `"Notes App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code For Note Taking App",
      html: htmlTemplate,
    });

    console.log(`✅ OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
}

module.exports = sendOTP;
