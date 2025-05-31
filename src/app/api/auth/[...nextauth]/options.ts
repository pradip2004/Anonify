import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export const authOptions: NextAuthOptions = {
      providers: [
            CredentialsProvider({
                  name: "Credentials",
                  credentials: {
                        email: { label: "Email", type: "text", placeholder: "jsmith" },
                        password: { label: "Password", type: "password" }
                  },
                  async authorize(credentials: any): Promise<any> {
                        await dbConnect();
                        try {
                              const user = await UserModel.findOne({
                                    $or: [
                                          { email: credentials.identifier },
                                          { username: credentials.identifier }
                                    ]
                              })
                              if (!user) {
                                    console.error("User not found");
                                    throw new Error("Invalid credentials");
                              }

                              if (!user.isVerified) {
                                    console.error("User not verified");
                                    throw new Error("User not verified");
                              }

                              const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                              if (!isPasswordValid) {
                                    console.error("Invalid password");
                                    throw new Error("Invalid credentials");
                              } else {
                                    return user;
                              }



                        } catch (err: any) {
                              console.error("Error connecting to the database:", err);
                              throw new Error("Database connection error");

                        }
                  }
            })
      ],
      pages: {
            signIn: "/sign-in"
      },
      session: {
            strategy: "jwt"
      },
      secret: process.env.NEXTAUTH_SECRET,
      callbacks: {
            async jwt({ token, user }) {
                  if (user) {
                        token._id = user._id?.toString();
                        token.isAcceptingMessages = user.isAcceptingMessages;
                        token.username = user.username;
                        token.isVerified = user.isVerified;
                  }
                  return token;
            },
             async session({ session, token }) {
                  if(token) {
                        session.user._id = token._id;
                        session.user.isVerified  = token.isVerified;
                        session.user.isAcceptingMessages = token.isAcceptingMessages;
                        session.user.username = token.username;
                  }
            return session;
      }
      },
     
}
