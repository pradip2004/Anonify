import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
      email: string,
      username: string,
      verifyCode: string
): Promise<ApiResponse> {
      try {
            await resend.emails.send({
                  from: "onboarding@resend.dev",
                  to: email,
                  subject: 'Mystry message | Verification code',
                  react: VerificationEmail({
                        username,
                        otp: verifyCode
                  })
            })
            console.log("Verification email sent to:", email);
            return {
                  success: true,
                  message: "Verification email sent successfully."
            }
      } catch (error) {
            console.error("Error sending verification email:", error);
            return {
                  success: false,
                  message: "Failed to send verification email. Please try again later."
            };
      }
}

   