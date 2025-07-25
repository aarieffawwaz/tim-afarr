// src/pages/admin/ActivityFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// Skema validasi form sesuai dengan payload API
const activityFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  project_type: z.string().min(2, "Project type is required."),

  // Details are nested
  details: z.object({
    meeting_point: z.string().optional(),
    difficulty: z.string().optional(),
    distance: z.string().optional(),
    type_description: z.string().optional(),
  }),

  // Skills and languages will be comma-separated strings in the form
  required_skills: z.string().min(2, "At least one skill is required."),
  required_languages: z.string().min(2, "At least one language is required."),

  min_experience: z.string().min(1, "Minimum experience is required."),
  start_date: z.string().min(1, "Start date is required."),
  end_date: z.string().min(1, "End date is required."),
  duration: z.string().min(1, "Duration is required."),
  max_volunteers: z.coerce
    .number()
    .min(1, "Max volunteers must be at least 1."),
});

type ActivityFormData = z.infer<typeof activityFormSchema>;

export default function ActivityFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(id);

  const form = useForm({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      project_type: "",
      details: {
        meeting_point: "",
        difficulty: "",
        distance: "",
        type_description: "",
      },
      required_skills: "",
      required_languages: "",
      min_experience: "",
      start_date: "",
      end_date: "",
      duration: "",
      max_volunteers: 1,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchActivity = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error("Activity not found");

          const data = await response.json();
          const activity = data.project;

          // Populate form with fetched data
          form.reset({
            ...activity,
            // Convert arrays back to comma-separated strings for the form
            required_skills: activity.required_skills.join(", "),
            required_languages: activity.required_languages.join(", "),
          });
        } catch (err) {
          setError("Failed to load activity data.");
        }
      };
      fetchActivity();
    }
  }, [id, isEditMode, form, token]);

  const onSubmit: SubmitHandler<ActivityFormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    // Transform comma-separated strings into arrays for the payload
    const payload = {
      ...data,
      required_skills: data.required_skills.split(",").map((s) => s.trim()),
      required_languages: data.required_languages
        .split(",")
        .map((s) => s.trim()),
    };

    const url = isEditMode
      ? `${API_BASE_URL}/api/projects/${id}`
      : `${API_BASE_URL}/api/projects`;
    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${isEditMode ? "update" : "create"} activity.`
        );
      }

      navigate("/admin/activities");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="outline" size="icon">
          <Link to="/admin/activities">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Activity" : "Create New Activity"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Provide the main details for the activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="project_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., explorers, study_group"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specific Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="details.meeting_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Point</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details.difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details.distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details.type_description"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Type Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements & Logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="required_skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated (e.g., walking, history knowledge)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="required_languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Languages</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated (e.g., Indonesian, English)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="min_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Experience</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="< 6 months">
                            {"< 6 months"}
                          </SelectItem>
                          <SelectItem value="6 months - 1 year">
                            6 months - 1 year
                          </SelectItem>
                          <SelectItem value="> 1 year">{"> 1 year"}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_volunteers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Volunteers</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={
                            typeof field.value === "number"
                              ? field.value.toString()
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || 0)
                          }
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEditMode
                ? "Update Activity"
                : "Create Activity"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
