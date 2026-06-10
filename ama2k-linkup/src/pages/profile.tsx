import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMyProfile, useUpdateMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, MapPin, Heart, User, Save, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().min(18, "Must be at least 18").max(100),
  gender: z.string().min(1, "Gender is required"),
  lookingFor: z.string().min(1, "Please select what you're looking for"),
  city: z.string().min(1, "City is required"),
  bio: z.string().min(1, "Bio is required"),
  photoUrl: z.string().url("Must be a valid URL"),
});

export default function Profile() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading, error } = useGetMyProfile({
    query: { queryKey: getGetMyProfileQueryKey() }
  });

  const updateProfile = useUpdateMyProfile();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      age: 18,
      gender: "",
      lookingFor: "",
      city: "",
      bio: "",
      photoUrl: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        lookingFor: profile.lookingFor,
        city: profile.city,
        bio: profile.bio,
        photoUrl: profile.photoUrl,
      });
    }
  }, [profile]);

  // Redirect to setup if no profile exists
  useEffect(() => {
    if (error) {
      navigate("/setup");
    }
  }, [error, navigate]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      await updateProfile.mutateAsync({ data: values });
      queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      setIsEditing(false);
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-56 bg-muted animate-pulse" />
        <div className="p-5 flex flex-col gap-3">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  if (isEditing) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <h1 className="text-xl font-bold">Edit Profile</h1>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsEditing(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} data-testid="input-name" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl><Input type="number" {...field} data-testid="input-age" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-gender" className="rounded-xl">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="nonbinary">Non-binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lookingFor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Looking for</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-looking-for" className="rounded-xl">
                        <SelectValue placeholder="Select intent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="relationship">Relationship</SelectItem>
                      <SelectItem value="friendship">Friendship</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input {...field} data-testid="input-city" placeholder="e.g. Harare" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl><Textarea {...field} data-testid="input-bio" rows={4} className="rounded-xl resize-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL</FormLabel>
                  <FormControl><Input {...field} data-testid="input-photo-url" placeholder="https://..." className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button
                data-testid="button-save-profile"
                type="submit"
                disabled={updateProfile.isPending}
                className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-white py-6 font-bold mt-2"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Photo header */}
      <div className="relative h-72 shrink-0">
        <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <Button
          data-testid="button-edit-profile"
          size="icon"
          variant="secondary"
          className="absolute top-4 right-4 rounded-full w-10 h-10 shadow-lg"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <div className="absolute bottom-4 left-5">
          <h1 className="text-white text-2xl font-bold">{profile.name}, {profile.age}</h1>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-white/70" />
            <span className="text-white/70 text-sm">{profile.city}</span>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">
            <Heart className="w-3 h-3 mr-1" />
            {profile.lookingFor}
          </Badge>
          <Badge variant="outline" className="capitalize">
            <User className="w-3 h-3 mr-1" />
            {profile.gender}
          </Badge>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">About me</h3>
          <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
        </div>

        {profile.interests && profile.interests.length > 0 && (
          <div className="bg-card border border-card-border rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span key={interest} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full capitalize border border-primary/20">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full rounded-full border-muted-foreground/20 text-muted-foreground hover:bg-muted mt-2"
          onClick={() => navigate("/setup")}
        >
          Create New Profile
        </Button>

        <Button
          data-testid="button-sign-out"
          variant="outline"
          className="w-full rounded-full border-destructive/30 text-destructive hover:bg-destructive/5"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
