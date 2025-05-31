import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcrypt";
import { success } from "zod/v4";



export async function POST(req: Request) {
      await dbConnect();

      try {
            const { email, username, password } = await req.json();

            const existingUserVerifiedByUsername = await UserModel.findOne({
                  username,
                  isVerified: true
            })

            if (existingUserVerifiedByUsername) {
                  return Response.json(
                        {
                              success: false,
                              message: "Username already exists."
                        },
                        { status: 400 }
                  )
            }

            const existingUserByEmail = await UserModel.findOne({ email });

            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit verification code

            if (existingUserByEmail) {
                  if (existingUserByEmail.isVerified) {
                        return Response.json(
                              {
                                    success: false,
                                    message: "Email already exists and is verified."
                              },
                              { status: 400 }
                        )
                  }else {
                        // If the user exists but is not verified, update the existing user
                        existingUserByEmail.username = username;
                        existingUserByEmail.password = await bcrypt.hash(password, 10);
                        existingUserByEmail.verifyCode = verifyCode;
                        existingUserByEmail.verifyCodeExpire = new Date(Date.now() + 3600000); // 1 hour from now

                        await existingUserByEmail.save();
                  }
            } else {
                  const hasedPassword = await bcrypt.hash(password, 10);
                  const expiryDate = new Date();
                  expiryDate.setHours(expiryDate.getHours() + 1);

                  const newUser = new UserModel({
                        username,
                        password: hasedPassword,
                        email,
                        verifyCode,
                        verifyCodeExpire: expiryDate,
                        isVerified: false,
                        isAcceptingMessages: true,
                        messages: []
                  })

                  await newUser.save();
            }

            const emailResponse = await sendVerificationEmail(
                  email,
                  username,
                  verifyCode
            )

            if( !emailResponse.success) {
                  return Response.json(
                        {
                              success: false,
                              message: emailResponse.message
                        },
                        { status: 500 }
                  )
            }

            return Response.json({
                  success: true,
                  message: "User registered successfully. Please check your email for verification code."
            }, {
                  status: 201
            })


      } catch (error) {
            console.error("Error in sign-up route:", error);
            return Response.json(
                  {
                        success: false,
                        message: "Error registering user."
                  },
                  { status: 500 }
            )
      }
}