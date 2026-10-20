// app/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, content }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setContent("");
        
        router.push("/main-page");
        router.refresh(); 
      } else {
        alert("Gagal menambahkan data");
      }
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Link href="/main-page" className="text-gray-600 mb-4 inline-block hover:underline">
          &larr; back
        </Link>
        
        <div className="bg-white p-6 shadow rounded">
          <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded mb-6">
            <span className="text-gray-600 font-medium">Image (Placeholder)</span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full p-3 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900"
                required
              />
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-12 rounded transition duration-200 disabled:opacity-50"
              >
                {isLoading ? "Menyimpan..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}