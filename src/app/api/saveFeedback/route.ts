import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import shortUUID from "short-uuid";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        status: "error",
        message: "unauthenticated",
      },
      {
        status: 401,
      }
    );
  }

  // Generate a short UUID for the new session
  const id = shortUUID.generate();

  // Parse the request payload
  const payload = await req.json();

  // Construct the data object to be inserted into the database
  const data = {
    id: id,
    feedback: payload,
    date: new Date(),
  };

  try {
    // Connect to MongoDB and get the 'feedback' collection
    const db = await connectToDatabase();
    const collection = db.collection("feedback");

    // Insert the new session data into the database
    await collection.insertOne(data);

    // Return a success response along with the generated ID
    return NextResponse.json(
      {
        status: "success",
        message: "sessionSuccessfullySaved",
        id: id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Handle any errors during the database operation
    return NextResponse.json(
      {
        status: "error",
        message: "errorAddingData",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
