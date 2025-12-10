import config from "../config";

export const newPasswordTemplate = (new_password: string) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your New Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
                <!-- Header -->
                <tr>
                <td style="padding: 20px 0; text-align: center; background-color: #4f46e5;">
                    <img src="https://pjuhcpuddlpvqsbwrvyq.supabase.co/storage/v1/object/public/assets//LOGO2.png" alt="${config.app_name} Logo" style="max-width: 200px; height: auto;">
                </td>
                </tr>

                <!-- Main Content -->
                <tr>
                <td style="background-color: #ffffff; padding: 40px 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td>
                        <h1 style="margin: 0 0 20px 0; font-size: 24px; line-height: 30px; color: #333333; font-weight: bold;">Your Password Has Been Reset</h1>
                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">As requested, we've reset your password for your account at ${config.app_name}. Here is your new temporary password:</p>

                        <!-- Password Box -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px; border: 1px solid #dddddd; border-radius: 5px;">
                            <tr>
                            <td style="padding: 20px; background-color: #f9fafb; text-align: center;">
                                <p style="margin: 0; font-size: 20px; font-family: monospace; color: #4f46e5; font-weight: bold;">${new_password}</p>
                            </td>
                            </tr>
                        </table>

                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px;"><strong>Important:</strong> For security reasons, please change this password immediately after logging in.</p>

                        <!-- CTA Button -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                            <tr>
                            <td style="border-radius: 4px; background-color: #4f46e5; text-align: center;">
                                <a href="https://techtong.com.bd/login" target="_blank" style="display: block; padding: 12px 24px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Login to Your Account</a>
                            </td>
                            </tr>
                        </table>

                        <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 24px;">If you didn't request a password reset, please contact our support team immediately as your account may be compromised.</p>

                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Best regards,<br>The ${config.app_name} Team</p>
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
                        <p style="margin: 0 0 10px 0;">&copy; 2025 ${config.app_name}. All rights reserved.</p>
                        <p style="margin: 0;">${config.app_address}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; color: #666666; font-size: 14px;">
                        <p style="margin: 0 0 10px 0;"><strong>Security Tip:</strong> Never share your password with anyone, including ${config.app_name} staff.</p>
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
