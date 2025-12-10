import config from "../config";

export const credentialMailTemplate = (data: {
  name: string;
  contact_number: string;
  email?: string;
  password: string;
}) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Account Credentials</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
                <!-- Header -->
                <tr>
                <td style="padding: 20px 0; text-align: center; background-color: #4f46e5;">
                    <img src="https://pjuhcpuddlpvqsbwrvyq.supabase.co/storage/v1/object/public/assets//LOGO2.png" alt="${
                      config.app_name
                    } Logo" style="max-width: 200px; height: auto;">
                </td>
                </tr>

                <!-- Main Content -->
                <tr>
                <td style="background-color: #ffffff; padding: 40px 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td>
                        <h1 style="margin: 0 0 20px 0; font-size: 24px; line-height: 30px; color: #333333; font-weight: bold;">Welcome to ${
                          config.app_name
                        }!</h1>
                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">Hi! ${
                          data.name
                        }, Your account has been created successfully. Now you can login with your email/contact number and password.</p>

                        <!-- Credentials Box -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px; border: 1px solid #dddddd; border-radius: 5px;">
                            <tr>
                            <td style="padding: 20px; background-color: #f9fafb;">
                                ${
                                  data.email &&
                                  `<p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Email:</strong> <span style="color: #4f46e5;">${data.email}</span></p>`
                                }
                                <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Contact Number:</strong> <span style="color: #4f46e5;">${
                                  data.contact_number
                                }</span></p>
                                <p style="margin: 0; font-size: 16px;"><strong>Password:</strong> <span style="color: #4f46e5;">${
                                  data.password
                                }</span></p>
                            </td>
                            </tr>
                        </table>

                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">For security reasons, we recommend changing your password after your first login.</p>

                        <!-- CTA Button -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                            <tr>
                            <td style="border-radius: 4px; background-color: #4f46e5; text-align: center;">
                                <a href="https://techtong.com.bd/login" target="_blank" style="display: block; padding: 12px 24px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Login to Your Account</a>
                            </td>
                            </tr>
                        </table>

                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Best regards,<br>The ${
                          config.app_name
                        } Team</p>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>

                <!-- Footer -->
                <tr>
                <td style="background-color: #f4f4f4; padding: 20px 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td style="text-align: center; padding-bottom: 10px; color: #666666; font-size: 14px;">
                        <p style="margin: 0 0 10px 0;">&copy; 2025 ${
                          config.app_name
                        }. All rights reserved.</p>
                        <p style="margin: 0;">${config.app_address}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; color: #666666; font-size: 14px;">
                        <p style="margin: 0 0 10px 0;">This email contains confidential information. Please do not share your credentials.</p>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
        </body>
    </html>

        `;
};
