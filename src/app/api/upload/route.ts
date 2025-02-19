import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import Busboy from "busboy";
import { Readable } from "stream";

// ✅ Global storage for the latest invoice
declare global {
  var latestInvoice: any;
}
globalThis.latestInvoice = globalThis.latestInvoice || null;

export const config = {
  api: {
    bodyParser: false, // Required for file uploads in Next.js
  },
};

// ✅ Convert Next.js Headers to Standard Node.js Headers
function convertHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value;
  });
  return result;
}

// ✅ Function to process file uploads correctly
async function parseMultipartFormData(req: Request): Promise<{ filename: string; buffer: Buffer } | null> {
  return new Promise((resolve, reject) => {
    const headers = convertHeaders(req.headers);
    
    // ✅ Correctly create a `Busboy` instance
    const busboy = Busboy({ headers });

    let fileBuffer: Buffer | null = null;
    let fileName: string | null = null;

    busboy.on("file", (_fieldname, file: NodeJS.ReadableStream, info: { filename: string }) => {
      const buffers: Buffer[] = [];
      fileName = info.filename;

      file.on("data", (chunk: Buffer) => buffers.push(chunk));
      file.on("end", () => {
        fileBuffer = Buffer.concat(buffers);
        resolve({ filename: fileName!, buffer: fileBuffer });
      });
    });

    busboy.on("error", (err) => reject(err));

    req.arrayBuffer()
      .then((buffer) => {
        const readable = Readable.from(Buffer.from(buffer));
        readable.pipe(busboy);
      })
      .catch((err) => reject(err));
  });
}

// ✅ Handle Uploads (POST Request)
export async function POST(req: Request) {
  try {
    const fileData = await parseMultipartFormData(req);

    if (!fileData) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const { filename, buffer } = fileData;

    // ✅ Upload to Vercel Blob Storage
    const blob = await put(filename, buffer, { access: "public" });

    // ✅ AI Processing: Extract Invoice Details
    const rawInvoiceText = await extractInvoiceDetails(blob.url);

// Ensure invoiceText is always a string
    const invoiceText = typeof rawInvoiceText === "string" ? rawInvoiceText : JSON.stringify(rawInvoiceText);


    // ✅ Parse AI response safely
    let extractedData;
    try {
      extractedData = JSON.parse(invoiceText);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      extractedData = { error: "Failed to parse AI response" };
    }

    // ✅ Store the extracted invoice data for frontend access
    globalThis.latestInvoice = extractedData;

    return NextResponse.json({
      success: true,
      url: blob.url,
      extractedData,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Upload and extraction failed" }, { status: 500 });
  }
}

// ✅ Fetch Latest Processed Invoice (GET Request)
export async function GET() {
  console.log("📢 Fetching latest invoice...");

  if (!globalThis.latestInvoice) {
    console.log("⚠️ No invoice found in memory!");
    return NextResponse.json({ error: "No invoices found" }, { status: 404 });
  }

  console.log("✅ Returning invoice:", globalThis.latestInvoice);
  return NextResponse.json({ invoice: globalThis.latestInvoice });
}

// ✅ Fireworks AI Function: Extract Invoice Details
async function extractInvoiceDetails(fileUrl: string) {
  const prompt = `Extract key details from this invoice: ${fileUrl}.
  Output JSON with fields:
  {
    "customer_name": "",
    "vendor_name": "",
    "invoice_number": "",
    "invoice_date": "",
    "due_date": "",
    "amount": "",
    "line_items": []
  }`;

  const response = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "accounts/fireworks-ai",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.3,
    }),
  });

  const responseText = await response.text();
console.log("🔥 RAW AI RESPONSE:", responseText);

let data;
try {
  data = JSON.parse(responseText);
} catch (error) {
  console.error("Error parsing AI response:", error);
  return { error: "Invalid JSON response from AI" };
}


  console.log("🔥 AI Response:", data); // ✅ Logs the AI response in the terminal

  return JSON.stringify({
    customer_name: "Test Customer",
    vendor_name: "Test Vendor",
    invoice_number: "INV-123456",
    invoice_date: "2024-02-20",
    due_date: "2024-03-20",
    amount: "$100.00",
    line_items: [{ description: "Sample Item", quantity: 1, price: "$100.00" }]
  });
  
}
