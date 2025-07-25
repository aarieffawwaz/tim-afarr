// src/pages/admin/MatchmakingListPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface Activity {
    id: number;
    title: string;
    status_project: string;
    max_volunteers: number;
    current_volunteers: number;
}

export default function MatchmakingListPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchActivities = async () => {
            const response = await fetch(`${API_BASE_URL}/api/projects`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            setActivities(data.projects);
            setIsLoading(false);
        };
        fetchActivities();
    }, [token]);

    if (isLoading) return <div>Memuat data...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">AI Volunteer Matching & Skill Roster</h1>
                <Input placeholder="Search Activity..." className="w-1/3" />
            </div>
            <div className="rounded-lg border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Activity</TableHead>
                            <TableHead>Activity Status</TableHead>
                            <TableHead>Volunteer Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell className="font-medium">{activity.title}</TableCell>
                                <TableCell>
                                    <Badge variant={activity.status_project === 'on_going' ? 'default' : 'secondary'}>
                                        {activity.status_project.replace(/_/g, ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>{`${activity.current_volunteers} / ${activity.max_volunteers}`}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild>
                                        <Link to={`/admin/matchmaking/${activity.id}`}>
                                            <Users className="mr-2 h-4 w-4" /> Assign Volunteers
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}