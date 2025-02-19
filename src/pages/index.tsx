import FileUpload from "@/components/FileUpload";
import InvoiceTable from "@/components/InvoiceTable";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Upload an Invoice</h1>
      <FileUpload />
      <InvoiceTable />
    </main>
  );
}
