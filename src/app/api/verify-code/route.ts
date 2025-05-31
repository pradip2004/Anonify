import dbConnect from "@/lib/dbConnect";
import { verifySchema } from "@/schemas/verifySchema";
import { UsernameQuerySchema } from "../check-username/route";
import UserModel from "@/model/User";

export async function POST(request: Request) {
      await dbConnect();

      try {
            const { username, code } = await request.json();
            if (!username || !code) {
                  return Response.json({
                        success: false,
                        message: "Username and code are required",
                  }, { status: 400 });
            }
            const validUsername = UsernameQuerySchema.safeParse({ username });
            const validCode = verifySchema.safeParse({ code });
            if (!validCode.success) {
                  const codeErrors = validCode.error.format().code?._errors || [];
                  return Response.json({
                        success: false,
                        message: codeErrors?.length > 0 ? codeErrors[0] : "Invalid code",
                  }, { status: 400 });
            }

            if (!validUsername.success) {
                  const usernameErrors = validUsername.error.format().username?._errors || [];
                  return Response.json({
                        success: false,
                        message: usernameErrors?.length > 0 ? usernameErrors[0] : "Invalid username",
                  }, { status: 400 });
            }

            const user = await UserModel.findOne({
                  username
            });
            if (!user) {
                  return Response.json({
                        success: false,
                        message: "User not found",
                  }, { status: 404 });
            }

            const isCodeValid = user.verifyCode === code;
            const isCodeNotExpired = new Date(user.verifyCodeExpire) > new Date();

            if(isCodeValid && isCodeNotExpired){
                  user.isVerified = true;
                  await user.save();
                  return Response.json({
                        success: true,
                        message: "User verified successfully",
                  }, { status: 200 });
            }

            if (!isCodeValid) {
                  return Response.json({
                        success: false,
                        message: "Invalid verification code",
                  }, { status: 400 });
            }

            if (!isCodeNotExpired) {
                  return Response.json({
                        success: false,
                        message: "Verification code has expired",
                  }, { status: 400 });
            }
            return Response.json({
                  success: false,
                  message: "Verification failed",
            }, { status: 400 });

      } catch (error) {
            console.error("Error in verify-code route:", error);
            return Response.json({
                  success: false,
                  message: "Internal Server Error",
            }, { status: 500 });

      }
}