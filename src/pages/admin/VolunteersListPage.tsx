// src/pages/admin/VolunteersListPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Definisikan tipe data untuk volunteer, termasuk 'role'
interface Volunteer {
  id: string;
  name: string;
  date_of_birth: string | null;
  country: string | null;
  created_at: string;
  role: 'admin' | 'volunteer';
}

export default function VolunteersListPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchVolunteers = async () => {
      if (!token) {
        setIsLoading(false);
        setError("Authentication token not found.");
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch volunteer data.");
        }

        const data = await response.json();
        
        // Filter array untuk hanya menampilkan user dengan role 'volunteer'
        const volunteersOnly = data.users.filter(
          (user: Volunteer) => user.role === 'volunteer'
        );
        
        setVolunteers(volunteersOnly);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolunteers();
  }, [token]);

  if (isLoading) {
    return <div className="p-8 text-center">Memuat data volunteer...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Volunteers List</h1>
        <div className="w-1/3">
          <Input placeholder="Search..." />
        </div>
      </div>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>DoB</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Registered At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers.length > 0 ? (
              volunteers.map((volunteer, index) => (
                <TableRow key={volunteer.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{volunteer.name}</TableCell>
                  <TableCell>
                    {volunteer.date_of_birth
                      ? new Date(volunteer.date_of_birth).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                      : "-"}
                  </TableCell>
                  <TableCell>{volunteer.country || "-"}</TableCell>
                  <TableCell>
                    {new Date(volunteer.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/admin/volunteers/${volunteer.id}`}>
                        Lihat Detail
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No volunteers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
