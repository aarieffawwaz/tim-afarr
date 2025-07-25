// src/pages/admin/DashboardPage.tsx
import { useEffect, useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
  Line,
  LineChart,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { subDays, format, parseISO, isAfter } from "date-fns";

// Tipe data untuk volunteer
interface Volunteer {
  id: string;
  name: string;
  country: string | null;
  date_of_birth: string | null;
  updated_at: string;
  volunteer_opportunities?: {
    [category: string]: { [skill: string]: boolean };
  };
}

// Tipe data untuk aktivitas
interface Activity {
  id: number;
  title: string;
  project_type: string;
  max_volunteers: number;
  current_volunteers: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
];

export default function AdminDashboardPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [volunteersRes, activitiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const volunteersData = await volunteersRes.json();
        const activitiesData = await activitiesRes.json();
        setVolunteers(volunteersData.users);
        setActivities(activitiesData.projects);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const countryData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    volunteers.forEach((v) => {
      const country = v.country || "Unknown";
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [volunteers]);

  const ageData = useMemo(() => {
    const ageGroups: { [key: string]: number } = {
      "20-29": 0,
      "30-39": 0,
      "40-49": 0,
      "50-59": 0,
      "60+": 0,
    };
    volunteers.forEach((v) => {
      if (v.date_of_birth) {
        const age =
          new Date().getFullYear() - new Date(v.date_of_birth).getFullYear();
        if (age <= 29) ageGroups["20-29"]++;
        else if (age <= 39) ageGroups["30-39"]++;
        else if (age <= 49) ageGroups["40-49"]++;
        else if (age <= 59) ageGroups["50-59"]++;
        else ageGroups["60+"]++;
      }
    });
    return Object.entries(ageGroups).map(([name, value]) => ({
      name,
      Total: value,
    }));
  }, [volunteers]);

  const volunteerCapacityData = useMemo(() => {
    return activities
      .map((act) => ({
        name: act.title,
        "Max Volunteers": act.max_volunteers,
        "Current Volunteers": act.current_volunteers,
      }))
      .slice(0, 5);
  }, [activities]);

  const registrationTrendData = useMemo(() => {
    const last7Days = new Map<string, number>();
    const sevenDaysAgo = subDays(new Date(), 7);

    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      last7Days.set(format(date, "MMM dd"), 0);
    }

    volunteers.forEach((v) => {
      const registrationDate = parseISO(v.updated_at);
      if (isAfter(registrationDate, sevenDaysAgo)) {
        const formattedDate = format(registrationDate, "MMM dd");
        if (last7Days.has(formattedDate)) {
          last7Days.set(formattedDate, last7Days.get(formattedDate)! + 1);
        }
      }
    });
    return Array.from(last7Days.entries()).map(([date, count]) => ({
      date,
      "New Volunteers": count,
    }));
  }, [volunteers]);

  const skillsData = useMemo(() => {
    const skillCounts: { [key: string]: number } = {};
    volunteers.forEach((v) => {
      if (v.volunteer_opportunities) {
        Object.values(v.volunteer_opportunities).forEach((category) => {
          Object.entries(category).forEach(([skill, hasSkill]) => {
            if (hasSkill) {
              const formattedSkill = skill
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
              skillCounts[formattedSkill] =
                (skillCounts[formattedSkill] || 0) + 1;
            }
          });
        });
      }
    });
    return Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [volunteers]);

  if (isLoading) return <div className="p-8">Memuat dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">IHS Analytics Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Volunteers</CardTitle>
          </CardHeader>
          <CardContent
            className="p-6"
            style={{ paddingTop: "24px !important" }}
          >
            <p className="text-9xl font-bold">{volunteers.length}</p>
            <div className="flex items-center gap-2 mt-6">
              <span className="text-green-500 text-xl">&#10003;</span>
              <span className="font-semibold text-base text-white bg-green-500 rounded px-2 py-1">
                +13 new volunteers this week
              </span>
            </div>
            <p className="text-gray-500 mt-2">from all the data collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Country Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {countryData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(240, 240, 240, 0.5)" }} />
                <Bar dataKey="Total" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-2 mt-6">
              <span className="text-green-500 text-xl">&#10003;</span>
              <span className="font-semibold text-base text-white bg-green-500 rounded px-2 py-1">
                Age data updated weekly
              </span>
            </div>
            <p className="text-gray-500 mt-2">from all registered volunteers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volunteer Registration Trend</CardTitle>
          <CardDescription>
            Jumlah pendaftaran volunteer baru dalam 7 hari terakhir.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={registrationTrendData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="New Volunteers"
                stroke="#8884d8"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Total Activities</CardTitle>
          </CardHeader>
          <CardContent
            className="p-6"
            style={{ paddingTop: "24px !important" }}
          >
            <p className="text-9xl font-bold">{activities.length}</p>
            <div className="flex items-center gap-2 mt-6">
              <span className="text-green-500 text-xl">&#10003;</span>
              <span className="font-semibold text-base text-white bg-green-500 rounded px-2 py-1">
                +6 new activities this month
              </span>
            </div>
            <p className="text-gray-500 mt-2">from all the data submitted</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Volunteer Capacity per Activity</CardTitle>
            <CardDescription>
              Perbandingan volunteer saat ini dengan kapasitas (5 aktivitas
              pertama).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volunteerCapacityData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="Current Volunteers"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Max Volunteers"
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 7 Volunteer Skills</CardTitle>
          <CardDescription>
            Keahlian yang paling banyak dimiliki oleh para volunteer.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={skillsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={120} fontSize={12} />
              <Tooltip cursor={{ fill: "rgba(240, 240, 240, 0.5)" }} />
              <Bar
                dataKey="count"
                name="Total Volunteers"
                radius={[0, 4, 4, 0]}
              >
                {skillsData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
