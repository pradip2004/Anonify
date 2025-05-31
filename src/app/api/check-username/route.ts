import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

export const UsernameQuerySchema = z.object({
      username: usernameValidation,
})

export async function GET(request: Request) {
      await dbConnect();

      try {
            const { searchParams } = new URL(request.url);
            const queryParams = {
                  username: searchParams.get("username"),
            }
            const result = UsernameQuerySchema.safeParse({ queryParams });

            if (!result.success) {
                  const usernameErrors = result.error.format().username?._errors || [];
                  return Response.json({
                        success: false,
                        message: usernameErrors?.length > 0 ? usernameErrors[0] : "Invalid username",
                  }, { status: 400 });

            }

            const { username } = result.data;

            const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

            if (existingVerifiedUser) {
                  return Response.json({
                        success: false,
                        message: "Username already exists",
                  }, { status: 409 });
            }
            return Response.json({
                  success: true,
                  message: "Username is available",
            }, { status: 200 });


      } catch (error) {
            return new Response("Internal Server Error", { status: 500 });

      }
}