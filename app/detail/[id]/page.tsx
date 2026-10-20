// app/detail/[id]/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

function DetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;
  
  const isEditMode = searchParams.get("edit") === "true";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItemDetail();
    }
  }, [id]);

  const fetchItemDetail = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const json = await res.json();
        setTitle(json.data.title);
        setDescription(json.data.description);
        setContent(json.data.content);
      } else {
        alert("Data tidak ditemukan atau Anda tidak memiliki akses");
        router.push("/main-page");
      }
    } catch (error) {
      console.error("Gagal mengambil detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, content }),
      });

      if (res.ok) {
        alert("Data berhasil diperbarui!");
        router.push("/main-page");
        router.refresh(); 
      } else {
        alert("Gagal memperbarui data");
      }
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="mb-4">
          <button 
            onClick={() => router.push("/main-page")} 
            className="text-gray-600 hover:underline"
          >
            &larr; back
          </button>
        </div>
        
        {isEditMode ? (
          <div className="bg-white p-6 shadow rounded">
            <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded mb-6">
              <span className="text-gray-600 font-medium">Image (Placeholder)</span>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
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
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-12 rounded transition duration-200 disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white p-6 shadow rounded flex flex-col items-center">
            <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded mb-6">
              <span className="text-gray-600 font-medium">image</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h1>
            
            <div className="w-full bg-gray-100 p-4 rounded mb-8 text-gray-700">
              {description}
            </div>

            <div className="w-full text-gray-800 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat Konten...</div>}>
      <DetailContent />
    </Suspense>
  );
}