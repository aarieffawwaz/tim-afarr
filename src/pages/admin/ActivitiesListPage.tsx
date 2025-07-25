// src/pages/admin/ActivitiesListPage.tsx
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
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Definisikan tipe data untuk aktivitas/proyek
interface Activity {
  id: number;
  title: string;
  project_type: string;
  start_date: string;
  end_date: string;
  status_project: "on_going" | "done" | "cancelled";
}

export default function ActivitiesListPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setActivities(data.projects);
      setIsLoading(false);
    };
    fetchActivities();
  }, [token]);

  const handleDelete = async (activityId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${activityId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete activity.");
      }

      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity.id !== activityId)
      );
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  if (isLoading) return <div>Memuat data aktivitas...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Activities List</h1>
        <div className="flex gap-4">
          <Input placeholder="Search Activity..." className="w-64" />
          <Button asChild>
            <Link to="/admin/activities/new">Create New +</Link>
          </Button>
        </div>
      </div>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Activity Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, index) => (
              <TableRow key={activity.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{activity.title}</TableCell>
                <TableCell className="capitalize">
                  {activity.project_type.replace(/_/g, " ")}
                </TableCell>
                <TableCell>
                  {new Date(activity.start_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(activity.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      activity.status_project === "on_going"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {activity.status_project.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {/* --- TOMBOL DETAIL DIKEMBALIKAN DI SINI --- */}
                  <Button asChild variant="ghost" size="icon">
                    {/* Arahkan ke halaman detail yang akan kita buat nanti */}
                    <Link to={`/admin/matchmaking`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button asChild variant="ghost" size="icon">
                    <Link to={`/admin/activities/edit/${activity.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the activity "{activity.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(activity.id)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
