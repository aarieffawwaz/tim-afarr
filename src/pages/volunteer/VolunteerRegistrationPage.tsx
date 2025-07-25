// src/pages/volunteer/VolunteerRegistrationPage.tsx
import { date, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Skema Validasi Form Disesuaikan dengan Payload ---
const formSchema = z.object({
  // Fields from original form
  firstName: z.string().min(1, "Nama depan harus diisi."),
  lastName: z.string().min(1, "Nama belakang harus diisi."),
  gender: z.enum(["Male", "Female"], {
    error: "Gender harus dipilih.",
  }),
  dateOfBirth: z.string().min(1, "Tanggal lahir harus diisi."),
  phone: z.string().min(10, "Nomor telepon tidak valid."),
  address1: z.string().min(5, "Alamat harus diisi."),
  city: z.string().min(2, "Kota harus diisi."),
  postalCode: z.string().min(5, "Kode pos tidak valid."),
  country: z.string().min(1, "Negara harus dipilih."),
  nationalities: z.string().min(2, "Kewarganegaraan harus diisi."),
  languages: z.string().min(2, "Bahasa yang dikuasai harus diisi."),

  // New fields from payload
  availability: z.string().min(2, "Ketersediaan harus diisi."),
  preferred_duration: z.enum(
    ["1 week", "2 weeks", "1 month", "> 1 month"],
    "Durasi harus dipilih."
  ),
  years_experience: z.enum(
    ["< 6 months", "6 months - 1 year", "> 1 year"],
    "Pengalaman harus dipilih."
  ),
  longest_experience: z.string().min(5, "Pengalaman harus diisi."),

  // Checkboxes now nested to match payload
  enneagram: z.object({
    helper: z.boolean().default(false),
    talkative: z.boolean().default(false),
    bookworm: z.boolean().default(false),
    challenger: z.boolean().default(false),
    investigator: z.boolean().default(false),
    orator: z.boolean().default(false),
  }),
  volunteer_opportunities: z.object({
    society_events: z.object({
      event_coordinator: z.boolean().default(false),
      art_show: z.boolean().default(false),
      photography_exhibition: z.boolean().default(false),
    }),
    skills: z.object({
      financial: z.boolean().default(false),
      pr: z.boolean().default(false),
      sales: z.boolean().default(false),
      administration: z.boolean().default(false),
    }),
    publishing: z.object({
      creative_writing: z.boolean().default(false),
      editing: z.boolean().default(false),
      graphic_design: z.boolean().default(false),
      indesign: z.boolean().default(false),
      proofreading: z.boolean().default(false),
    }),
    interest_area: z.object({
      travel_organizer: z.boolean().default(false),
      translation: z.boolean().default(false),
    }),
    library: z.object({
      front_desk_assistance: z.boolean().default(false),
      cataloguing: z.boolean().default(false),
      data_entry: z.boolean().default(false),
    }),
    museum: z.object({
      collection_inventory: z.boolean().default(false),
      training: z.boolean().default(false),
      materials_preparation: z.boolean().default(false),
    }),
  }),
});

type VolunteerFormData = z.infer<typeof formSchema>;

// --- Komponen Halaman Utama ---
export default function VolunteerRegistrationPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VolunteerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Personal Info
      firstName: user?.name.split(" ")[0] || "",
      lastName: user?.name.split(" ").slice(1).join(" ") || "",
      gender: undefined, // Biarkan kosong agar placeholder muncul
      dateOfBirth: "",
      phone: "",

      // Address
      address1: "",
      city: "",
      postalCode: "",
      country: "",
      nationalities: "",
      languages: "",

      // New fields from payload
      availability: "",
      preferred_duration: undefined, // Biarkan kosong agar placeholder muncul
      years_experience: undefined, // Biarkan kosong agar placeholder muncul
      longest_experience: "",

      // Checkboxes
      enneagram: {
        helper: false,
        talkative: false,
        bookworm: false,
        challenger: false,
        investigator: false,
        orator: false,
      },
      volunteer_opportunities: {
        society_events: {},
        skills: {},
        publishing: {},
        interest_area: {},
        library: {},
        museum: {},
      },
    },
  });

  async function onSubmit(values: VolunteerFormData) {
    setIsLoading(true);

    // --- Transformasi Data ke Struktur Payload ---
    const payload = {
      phone: values.phone,
      gender: values.gender,
      date_of_birth: values.dateOfBirth,
      address: `${values.address1}, ${values.city}, ${values.country}`,
      postal_code: values.postalCode,
      country: values.country,
      nationalities: values.nationalities.split(",").map((item) => item.trim()),
      languages: values.languages.split(",").map((item) => item.trim()),
      preferred_duration: values.preferred_duration,
      years_experience: values.years_experience,
      longest_experience: values.longest_experience,
      availability: values.availability,
      enneagram: values.enneagram,
      volunteer_opportunities: values.volunteer_opportunities,
    };

    console.log("Payload yang akan dikirim:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload), // Kirim payload yang sudah ditransformasi
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal memperbarui profil.");
      }
      alert("Profil Anda berhasil diperbarui!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 flex justify-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white p-8 md:p-10 rounded-xl border">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Registration Form
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("VALIDATION ERRORS:", errors);
            })}
            className="space-y-8"
          >
            {/* --- Form fields here are the same as before, but names are updated to match new schema --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="First" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>&nbsp;</FormLabel>
                    <FormControl>
                      <Input placeholder="Last" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-8 pt-2"
                    >
                      <FormItem className="flex items-center space-x-3 mb-2">
                        <FormControl>
                          <RadioGroupItem value="Male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 mb-2">
                        <FormControl>
                          <RadioGroupItem value="Female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h2 className="text-xl font-semibold border-b pb-2">Address</h2>
            <FormField
              control={form.control}
              name="address1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1*</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih negara" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Afghanistan">Afghanistan</SelectItem>

                      <SelectItem value="Albania">Albania</SelectItem>

                      <SelectItem value="Algeria">Algeria</SelectItem>

                      <SelectItem value="Andorra">Andorra</SelectItem>

                      <SelectItem value="Angola">Angola</SelectItem>

                      <SelectItem value="Antigua and Barbuda">
                        Antigua and Barbuda
                      </SelectItem>

                      <SelectItem value="Argentina">Argentina</SelectItem>

                      <SelectItem value="Armenia">Armenia</SelectItem>

                      <SelectItem value="Australia">Australia</SelectItem>

                      <SelectItem value="Austria">Austria</SelectItem>

                      <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>

                      <SelectItem value="Bahamas">Bahamas</SelectItem>

                      <SelectItem value="Bahrain">Bahrain</SelectItem>

                      <SelectItem value="Bangladesh">Bangladesh</SelectItem>

                      <SelectItem value="Barbados">Barbados</SelectItem>

                      <SelectItem value="Belarus">Belarus</SelectItem>

                      <SelectItem value="Belgium">Belgium</SelectItem>

                      <SelectItem value="Belize">Belize</SelectItem>

                      <SelectItem value="Benin">Benin</SelectItem>

                      <SelectItem value="Bhutan">Bhutan</SelectItem>

                      <SelectItem value="Bolivia">Bolivia</SelectItem>

                      <SelectItem value="Bosnia and Herzegovina">
                        Bosnia and Herzegovina
                      </SelectItem>

                      <SelectItem value="Botswana">Botswana</SelectItem>

                      <SelectItem value="Brazil">Brazil</SelectItem>

                      <SelectItem value="Brunei">Brunei</SelectItem>

                      <SelectItem value="Bulgaria">Bulgaria</SelectItem>

                      <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>

                      <SelectItem value="Burundi">Burundi</SelectItem>

                      <SelectItem value="Cabo Verde">Cabo Verde</SelectItem>

                      <SelectItem value="Cambodia">Cambodia</SelectItem>

                      <SelectItem value="Cameroon">Cameroon</SelectItem>

                      <SelectItem value="Canada">Canada</SelectItem>

                      <SelectItem value="Central African Republic">
                        Central African Republic
                      </SelectItem>

                      <SelectItem value="Chad">Chad</SelectItem>

                      <SelectItem value="Chile">Chile</SelectItem>

                      <SelectItem value="China">China</SelectItem>

                      <SelectItem value="Colombia">Colombia</SelectItem>

                      <SelectItem value="Comoros">Comoros</SelectItem>

                      <SelectItem value="Congo">Congo</SelectItem>

                      <SelectItem value="Costa Rica">Costa Rica</SelectItem>

                      <SelectItem value="Croatia">Croatia</SelectItem>

                      <SelectItem value="Cuba">Cuba</SelectItem>

                      <SelectItem value="Cyprus">Cyprus</SelectItem>

                      <SelectItem value="Czech Republic">
                        Czech Republic
                      </SelectItem>

                      <SelectItem value="Denmark">Denmark</SelectItem>

                      <SelectItem value="Djibouti">Djibouti</SelectItem>

                      <SelectItem value="Dominica">Dominica</SelectItem>

                      <SelectItem value="Dominican Republic">
                        Dominican Republic
                      </SelectItem>

                      <SelectItem value="Ecuador">Ecuador</SelectItem>

                      <SelectItem value="Egypt">Egypt</SelectItem>

                      <SelectItem value="El Salvador">El Salvador</SelectItem>

                      <SelectItem value="Equatorial Guinea">
                        Equatorial Guinea
                      </SelectItem>

                      <SelectItem value="Eritrea">Eritrea</SelectItem>

                      <SelectItem value="Estonia">Estonia</SelectItem>

                      <SelectItem value="Eswatini">Eswatini</SelectItem>

                      <SelectItem value="Ethiopia">Ethiopia</SelectItem>

                      <SelectItem value="Fiji">Fiji</SelectItem>

                      <SelectItem value="Finland">Finland</SelectItem>

                      <SelectItem value="France">France</SelectItem>

                      <SelectItem value="Gabon">Gabon</SelectItem>

                      <SelectItem value="Gambia">Gambia</SelectItem>

                      <SelectItem value="Georgia">Georgia</SelectItem>

                      <SelectItem value="Germany">Germany</SelectItem>

                      <SelectItem value="Ghana">Ghana</SelectItem>

                      <SelectItem value="Greece">Greece</SelectItem>

                      <SelectItem value="Grenada">Grenada</SelectItem>

                      <SelectItem value="Guatemala">Guatemala</SelectItem>

                      <SelectItem value="Guinea">Guinea</SelectItem>

                      <SelectItem value="Guinea-Bissau">
                        Guinea-Bissau
                      </SelectItem>

                      <SelectItem value="Guyana">Guyana</SelectItem>

                      <SelectItem value="Haiti">Haiti</SelectItem>

                      <SelectItem value="Honduras">Honduras</SelectItem>

                      <SelectItem value="Hungary">Hungary</SelectItem>

                      <SelectItem value="Iceland">Iceland</SelectItem>

                      <SelectItem value="India">India</SelectItem>

                      <SelectItem value="Indonesia">Indonesia</SelectItem>

                      <SelectItem value="Iran">Iran</SelectItem>

                      <SelectItem value="Iraq">Iraq</SelectItem>

                      <SelectItem value="Ireland">Ireland</SelectItem>

                      <SelectItem value="Israel">Israel</SelectItem>

                      <SelectItem value="Italy">Italy</SelectItem>

                      <SelectItem value="Jamaica">Jamaica</SelectItem>

                      <SelectItem value="Japan">Japan</SelectItem>

                      <SelectItem value="Jordan">Jordan</SelectItem>

                      <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>

                      <SelectItem value="Kenya">Kenya</SelectItem>

                      <SelectItem value="Kiribati">Kiribati</SelectItem>

                      <SelectItem value="Kuwait">Kuwait</SelectItem>

                      <SelectItem value="Kyrgyzstan">Kyrgyzstan</SelectItem>

                      <SelectItem value="Laos">Laos</SelectItem>

                      <SelectItem value="Latvia">Latvia</SelectItem>

                      <SelectItem value="Lebanon">Lebanon</SelectItem>

                      <SelectItem value="Lesotho">Lesotho</SelectItem>

                      <SelectItem value="Liberia">Liberia</SelectItem>

                      <SelectItem value="Libya">Libya</SelectItem>

                      <SelectItem value="Liechtenstein">
                        Liechtenstein
                      </SelectItem>

                      <SelectItem value="Lithuania">Lithuania</SelectItem>

                      <SelectItem value="Luxembourg">Luxembourg</SelectItem>

                      <SelectItem value="Madagascar">Madagascar</SelectItem>

                      <SelectItem value="Malawi">Malawi</SelectItem>

                      <SelectItem value="Malaysia">Malaysia</SelectItem>

                      <SelectItem value="Maldives">Maldives</SelectItem>

                      <SelectItem value="Mali">Mali</SelectItem>

                      <SelectItem value="Malta">Malta</SelectItem>

                      <SelectItem value="Marshall Islands">
                        Marshall Islands
                      </SelectItem>

                      <SelectItem value="Mauritania">Mauritania</SelectItem>

                      <SelectItem value="Mauritius">Mauritius</SelectItem>

                      <SelectItem value="Mexico">Mexico</SelectItem>

                      <SelectItem value="Micronesia">Micronesia</SelectItem>

                      <SelectItem value="Moldova">Moldova</SelectItem>

                      <SelectItem value="Monaco">Monaco</SelectItem>

                      <SelectItem value="Mongolia">Mongolia</SelectItem>

                      <SelectItem value="Montenegro">Montenegro</SelectItem>

                      <SelectItem value="Morocco">Morocco</SelectItem>

                      <SelectItem value="Mozambique">Mozambique</SelectItem>

                      <SelectItem value="Myanmar">Myanmar</SelectItem>

                      <SelectItem value="Namibia">Namibia</SelectItem>

                      <SelectItem value="Nauru">Nauru</SelectItem>

                      <SelectItem value="Nepal">Nepal</SelectItem>

                      <SelectItem value="Netherlands">Netherlands</SelectItem>

                      <SelectItem value="New Zealand">New Zealand</SelectItem>

                      <SelectItem value="Nicaragua">Nicaragua</SelectItem>

                      <SelectItem value="Niger">Niger</SelectItem>

                      <SelectItem value="Nigeria">Nigeria</SelectItem>

                      <SelectItem value="North Korea">North Korea</SelectItem>

                      <SelectItem value="North Macedonia">
                        North Macedonia
                      </SelectItem>

                      <SelectItem value="Norway">Norway</SelectItem>

                      <SelectItem value="Oman">Oman</SelectItem>

                      <SelectItem value="Pakistan">Pakistan</SelectItem>

                      <SelectItem value="Palau">Palau</SelectItem>

                      <SelectItem value="Palestine">Palestine</SelectItem>

                      <SelectItem value="Panama">Panama</SelectItem>

                      <SelectItem value="Papua New Guinea">
                        Papua New Guinea
                      </SelectItem>

                      <SelectItem value="Paraguay">Paraguay</SelectItem>

                      <SelectItem value="Peru">Peru</SelectItem>

                      <SelectItem value="Philippines">Philippines</SelectItem>

                      <SelectItem value="Poland">Poland</SelectItem>

                      <SelectItem value="Portugal">Portugal</SelectItem>

                      <SelectItem value="Qatar">Qatar</SelectItem>

                      <SelectItem value="Romania">Romania</SelectItem>

                      <SelectItem value="Russia">Russia</SelectItem>

                      <SelectItem value="Rwanda">Rwanda</SelectItem>

                      <SelectItem value="Saint Kitts and Nevis">
                        Saint Kitts and Nevis
                      </SelectItem>

                      <SelectItem value="Saint Lucia">Saint Lucia</SelectItem>

                      <SelectItem value="Saint Vincent and the Grenadines">
                        Saint Vincent and the Grenadines
                      </SelectItem>

                      <SelectItem value="Samoa">Samoa</SelectItem>

                      <SelectItem value="San Marino">San Marino</SelectItem>

                      <SelectItem value="Sao Tome and Principe">
                        Sao Tome and Principe
                      </SelectItem>

                      <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>

                      <SelectItem value="Senegal">Senegal</SelectItem>

                      <SelectItem value="Serbia">Serbia</SelectItem>

                      <SelectItem value="Seychelles">Seychelles</SelectItem>

                      <SelectItem value="Sierra Leone">Sierra Leone</SelectItem>

                      <SelectItem value="Singapore">Singapore</SelectItem>

                      <SelectItem value="Slovakia">Slovakia</SelectItem>

                      <SelectItem value="Slovenia">Slovenia</SelectItem>

                      <SelectItem value="Solomon Islands">
                        Solomon Islands
                      </SelectItem>

                      <SelectItem value="Somalia">Somalia</SelectItem>

                      <SelectItem value="South Africa">South Africa</SelectItem>

                      <SelectItem value="South Korea">South Korea</SelectItem>

                      <SelectItem value="South Sudan">South Sudan</SelectItem>

                      <SelectItem value="Spain">Spain</SelectItem>

                      <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>

                      <SelectItem value="Sudan">Sudan</SelectItem>

                      <SelectItem value="Suriname">Suriname</SelectItem>

                      <SelectItem value="Sweden">Sweden</SelectItem>

                      <SelectItem value="Switzerland">Switzerland</SelectItem>

                      <SelectItem value="Syria">Syria</SelectItem>

                      <SelectItem value="Taiwan">Taiwan</SelectItem>

                      <SelectItem value="Tajikistan">Tajikistan</SelectItem>

                      <SelectItem value="Tanzania">Tanzania</SelectItem>

                      <SelectItem value="Thailand">Thailand</SelectItem>

                      <SelectItem value="Timor-Leste">Timor-Leste</SelectItem>

                      <SelectItem value="Togo">Togo</SelectItem>

                      <SelectItem value="Tonga">Tonga</SelectItem>

                      <SelectItem value="Trinidad and Tobago">
                        Trinidad and Tobago
                      </SelectItem>

                      <SelectItem value="Tunisia">Tunisia</SelectItem>

                      <SelectItem value="Turkey">Turkey</SelectItem>

                      <SelectItem value="Turkmenistan">Turkmenistan</SelectItem>

                      <SelectItem value="Tuvalu">Tuvalu</SelectItem>

                      <SelectItem value="Uganda">Uganda</SelectItem>

                      <SelectItem value="Ukraine">Ukraine</SelectItem>

                      <SelectItem value="United Arab Emirates">
                        United Arab Emirates
                      </SelectItem>

                      <SelectItem value="United Kingdom">
                        United Kingdom
                      </SelectItem>

                      <SelectItem value="United States">
                        United States
                      </SelectItem>

                      <SelectItem value="Uruguay">Uruguay</SelectItem>

                      <SelectItem value="Uzbekistan">Uzbekistan</SelectItem>

                      <SelectItem value="Vanuatu">Vanuatu</SelectItem>

                      <SelectItem value="Vatican City">Vatican City</SelectItem>

                      <SelectItem value="Venezuela">Venezuela</SelectItem>

                      <SelectItem value="Vietnam">Vietnam</SelectItem>

                      <SelectItem value="Yemen">Yemen</SelectItem>

                      <SelectItem value="Zambia">Zambia</SelectItem>

                      <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <h2 className="text-xl font-semibold border-b pb-2">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nationalities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality(ies)</FormLabel>
                    <FormControl>
                      <Input placeholder="Indonesian, American" {...field} />
                    </FormControl>
                    <FormDescription>Pisahkan dengan koma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages Spoken</FormLabel>
                    <FormControl>
                      <Input placeholder="Indonesian, English" {...field} />
                    </FormControl>
                    <FormDescription>Pisahkan dengan koma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferred_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Duration</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 week">1 week</SelectItem>
                        <SelectItem value="2 weeks">2 weeks</SelectItem>
                        <SelectItem value="1 month">1 month</SelectItem>
                        <SelectItem value="> 1 month">&gt; 1 month</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="years_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years Experience</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="< 6 months">
                          &lt; 6 months
                        </SelectItem>
                        <SelectItem value="6 months - 1 year">
                          6 months - 1 year
                        </SelectItem>
                        <SelectItem value="> 1 year">&gt; 1 year</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <FormControl>
                      <Input placeholder="Full-time / Weekends" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longest_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longest Experience</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Heritage volunteer for 5 years"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h2 className="text-xl font-semibold border-b pb-2">Enneagram</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="enneagram.helper"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="mb-2">Helper</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enneagram.bookworm"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Bookworm</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enneagram.talkative"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Talkative</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enneagram.challenger"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Challenger</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enneagram.investigator"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Investigator</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enneagram.orator"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Orator</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <h2 className="text-xl font-bold border-b pb-2">
              Volunteer Opportunities
            </h2>
            <div className="space-y-4">
              <h3 className="font-semibold">Society Events</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.society_events.event_coordinator"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Event Coordinator</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.society_events.art_show"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Art Show</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.society_events.photography_exhibition"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Photography Exhibition</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <h3 className="font-semibold">Skills</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.skills.financial"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Financial</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.skills.pr"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>PR</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.skills.sales"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Sales</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.skills.administration"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Administration</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <h3 className="font-semibold">Publishing</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.publishing.creative_writing"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Creative Writing</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.publishing.editing"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Editing</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.publishing.graphic_design"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Graphic Design</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.publishing.indesign"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>InDesign</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.publishing.proofreading"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Proof reading</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <h3 className="font-semibold">Interest Area</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.interest_area.travel_organizer"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Travel Organizer</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.interest_area.translation"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Translation</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <h3 className="font-semibold">Library</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.library.front_desk_assistance"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Front Desk Assistance</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.library.cataloguing"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Cataloguing</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.library.data_entry"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Data Entry</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <h3 className="font-semibold">Museum</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.museum.collection_inventory"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Collection Inventory</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.museum.training"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Training</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volunteer_opportunities.museum.materials_preparation"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Materials preparation</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
