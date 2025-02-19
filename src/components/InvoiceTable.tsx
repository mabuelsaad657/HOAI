"use client";
import { useEffect, useState } from "react";

interface Invoice {
  customer_name: string;
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  amount: string;
}

export default function InvoiceTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/upload"); // Fetch from API
        if (!res.ok) throw new Error("Failed to fetch invoices");
    
        const data = await res.json();
    
        // ✅ Check if data is already an object
        const extractedData = typeof data.extractedData === "string"
          ? JSON.parse(data.extractedData)
          : data.extractedData;
    
        if (!extractedData || Object.keys(extractedData).length === 0) {
          throw new Error("No invoices found");
        }
    
        setInvoices([extractedData]); // ✅ Ensure data is correctly formatted
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
      setLoading(false);
    };
    

    fetchInvoices();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Processed Invoices</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Customer</th>
              <th className="border p-2">Vendor</th>
              <th className="border p-2">Invoice #</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Due Date</th>
              <th className="border p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
          {invoices.length > 0 ? (
  invoices.map((invoice, index) => (
    <tr key={index}>
      <td className="border p-2">{invoice?.customer_name || "N/A"}</td>
      <td className="border p-2">{invoice?.vendor_name || "N/A"}</td>
      <td className="border p-2">{invoice?.invoice_number || "N/A"}</td>
      <td className="border p-2">{invoice?.invoice_date || "N/A"}</td>
      <td className="border p-2">{invoice?.due_date || "N/A"}</td>
      <td className="border p-2">${invoice?.amount || "0.00"}</td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan={6} className="border p-2 text-center text-gray-500">
      No invoices processed yet.
    </td>
  </tr>
)}

          </tbody>
        </table>
      )}
    </div>
  );
}
