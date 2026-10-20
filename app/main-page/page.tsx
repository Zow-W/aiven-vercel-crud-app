// app/main-page/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Item {
  id: number;
  image_url: string | null;
  title: string;
  description: string;
  created_at: string;
}

export default function MainPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setItems(json.data);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(items.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data? Aksi ini tidak dapat dibatalkan!")) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/items", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setItems([])
      } else {
        alert("Gagal menghapus semua data");
      }
    } catch (error) {
      console.error("Gagal menghapus semua:", error);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="flex justify-between items-center p-6 max-w-5xl mx-auto">
        <div className="bg-gray-200 px-6 py-2 rounded text-xl font-bold">CRUD</div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {/* Tombol Delete All hanya dirender jika isUpdateMode aktif */}
            {isUpdateMode && (
              <button 
                onClick={handleDeleteAll} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete All
              </button>
            )}
            <button onClick={handleLogout} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">
              Logout
            </button>
          </div>
          <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded">
            <input
              type="checkbox"
              id="updateMode"
              checked={isUpdateMode}
              onChange={(e) => setIsUpdateMode(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="updateMode">update mode</label>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            + Tambah Data
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded shadow flex flex-col overflow-hidden">
              <div className="h-48 bg-gray-300 flex items-center justify-center relative">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-500">Image</span>
                )}
                {!isUpdateMode && (
                   <Link href={`/detail/${item.id}`} className="absolute inset-0 z-10"></Link>
                )}
              </div>
              
              <div className="bg-gray-400 text-gray-900 p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm mt-1">{item.description}</p>
                </div>
                <div className="mt-4 text-xs text-right">
                  Created at: {new Date(item.created_at).toLocaleDateString()}
                </div>
                
                {isUpdateMode && (
                  <div className="mt-4 flex justify-between gap-2 relative z-20">
                    <Link
                      href={`/detail/${item.id}?edit=true`}
                      className="bg-gray-100 text-center flex-1 py-1 rounded hover:bg-gray-200"
                    >
                      Update
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-gray-100 text-center flex-1 py-1 rounded hover:bg-red-200 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-500">Belum ada data.</p>}
        </div>
      </main>
    </div>
  );
}