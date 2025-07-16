import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

export const config = {
  api: {
    bodyParser: false,
  },
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file found" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image", folder: "profile_pictures" }, (err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
        .end(buffer)
    })

    return NextResponse.json({ secure_url: result.secure_url })
  } catch (err) {
    console.error("Cloudinary error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
