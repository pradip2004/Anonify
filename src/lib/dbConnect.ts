import mongoose from "mongoose";

type ConnectionObject = {
      isConnected?: number;
}

const connection: ConnectionObject = {};

const dbConnect = async (): Promise<void> => {
      if (connection.isConnected) {
            console.log("already connected to the database");
            return;
      }
      try {
            const dp = await mongoose.connect(process.env.MONGODB_URI as string)

            connection.isConnected = dp.connections[0].readyState;

            console.log("Connected to the database successfully");
      } catch (error) {
            console.error("Error connecting to the database:", error);
            process.exit(1)       
      }
}

export default dbConnect;