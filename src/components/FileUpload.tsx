"use client";
import { useState } from "react";

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    setUploading(false);

    if (result.success) {
      setFileUrl(result.url);
    } else {
      alert("Upload failed");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="mt-2 p-2 bg-blue-500 text-white rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {fileUrl && (
        <p className="mt-4">
          File uploaded: <a href={fileUrl} target="_blank">{fileUrl}</a>
        </p>
      )}
    </div>
  );
}
