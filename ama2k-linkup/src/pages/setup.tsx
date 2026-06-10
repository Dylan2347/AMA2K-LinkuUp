import { useLocation } from "wouter";
import { useCreateProfile } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const setupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().min(18, "Must be at least 18").max(100),
  gender: z.string().min(1, "Gender is required"),
  lookingFor: z.string().min(1, "Please select what you're looking for"),
  city: z.string().min(1, "City is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  photoUrl: z.string().url("Must be a valid URL"),
});

export default function Setup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createProfile = useCreateProfile();

  const form = useForm({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: "",
      age: 22 as number,
      gender: "",
      lookingFor: "",
      city: "Harare",
      bio: "",
      photoUrl: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof setupSchema>) => {
    try {
      await createProfile.mutateAsync({ data: { ...values, photos: [], interests: [] } });
      toast({ title: "Profile created!", description: "Welcome to AMA2K LinkUp!" });
      navigate("/discover");
    } catch {
      toast({ title: "Error", description: "Failed to create profile. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-primary/5 to-background">
      {/* Hero */}
      <div className="px-6 pt-10 pb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-1">AMA2K LinkUp</h1>
        <p className="text-muted-foreground text-sm">Zimbabwe's social connection app</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-8">
        <div className="bg-card border border-card-border rounded-3xl p-5 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Create your profile</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-name" placeholder="Your name" className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-age" min={18} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-gender" className="rounded-xl">
                          <SelectValue placeholder="Select" />
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
              </div>

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
                  <FormControl>
                    <Input {...field} data-testid="input-city" placeholder="e.g. Harare, Bulawayo, Mutare" className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      data-testid="input-bio"
                      placeholder="Tell people about yourself..."
                      rows={3}
                      className="rounded-xl resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile photo URL</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-photo-url" placeholder="https://..." className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {form.watch("photoUrl") && (
                <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto border-2 border-primary/20">
                  <img
                    src={form.watch("photoUrl")}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}

              <Button
                data-testid="button-create-profile"
                type="submit"
                disabled={createProfile.isPending}
                className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-white py-6 font-bold text-base shadow-lg shadow-primary/30 mt-2"
              >
                {createProfile.isPending ? "Creating your profile..." : "Join AMA2K LinkUp"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
