// src/pages/admin/VolunteerDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Tipe data lengkap untuk volunteer sesuai response API
interface VolunteerDetail {
  id: string;
  name: string;
  date_of_birth: string | null;
  gender: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  nationalities: string[] | null;
  languages: string[] | null;
  availability: string | null;
  preferred_duration: string | null;
  years_experience: string | null;
  status_volunteer: string;
  enneagram: { [key: string]: boolean };
  volunteer_opportunities: { [key: string]: { [key: string]: boolean } };
}

// Komponen kecil untuk menampilkan item detail
const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | string[] | null | undefined;
}) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-base text-gray-800">
      {Array.isArray(value) ? value.join(", ") : value || "-"}
    </p>
  </div>
);

// Komponen untuk menampilkan interest/skill yang dipilih
const InterestList = ({
  title,
  interests,
}: {
  title: string;
  interests: object | undefined;
}) => {
  if (!interests) return null;

  const selectedInterests = Object.entries(interests).flatMap(([, skills]) =>
    Object.entries(skills)
      .filter(([, hasSkill]) => hasSkill)
      .map(([skill]) =>
        skill.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      )
  );

  if (selectedInterests.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold border-b pb-2 mb-4">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {selectedInterests.map((interest) => (
          <Badge key={interest} variant="secondary">
            {interest}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default function VolunteerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [volunteer, setVolunteer] = useState<VolunteerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchVolunteerDetail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const foundVolunteer = data.users.find((v: any) => v.id === id);
        setVolunteer(foundVolunteer);
      } catch (error) {
        console.error("Gagal mengambil detail volunteer:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVolunteerDetail();
  }, [id, token]);

  if (isLoading) return <div className="p-8">Loading volunteer details...</div>;
  if (!volunteer) return <div className="p-8">Volunteer not found.</div>;

  const personalityTypes = Object.entries(volunteer.enneagram)
    .filter(([, value]) => value)
    .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Detail Volunteer</h1>
          <p className="text-muted-foreground">{volunteer.name}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin/volunteers">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DetailItem label="Full Name" value={volunteer.name} />
              <DetailItem
                label="Date of Birth"
                value={
                  volunteer.date_of_birth
                    ? new Date(volunteer.date_of_birth).toLocaleDateString()
                    : "-"
                }
              />
              <DetailItem label="Gender" value={volunteer.gender} />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DetailItem label="Email" value={volunteer.email} />
              <DetailItem label="Phone" value={volunteer.phone} />
            </div>
          </div>

          {/* Place of Origin */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              Place of Origin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DetailItem label="Address" value={volunteer.address} />
              <DetailItem label="Postal Code" value={volunteer.postal_code} />
              <DetailItem label="Country" value={volunteer.country} />
              <DetailItem label="Nationality" value={volunteer.nationalities} />
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              Languages Spoken
            </h3>
            <DetailItem label="Languages" value={volunteer.languages} />
          </div>

          {/* Volunteer Activity Interest */}
          <InterestList
            title="Volunteer Activity Interest"
            interests={volunteer.volunteer_opportunities}
          />

          {/* Preference */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              Preference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DetailItem label="Availability" value={volunteer.availability} />
              <DetailItem
                label="Preferred Duration"
                value={volunteer.preferred_duration}
              />
              <DetailItem
                label="Years of Experience"
                value={volunteer.years_experience}
              />
            </div>
          </div>

          {/* Temani's Enneagram */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              Temani's Enneagram
            </h3>
            <DetailItem
              label="Personality"
              value={
                personalityTypes.length > 0 ? personalityTypes : "Not specified"
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
