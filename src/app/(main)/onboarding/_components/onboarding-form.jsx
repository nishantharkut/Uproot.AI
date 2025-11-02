"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { onboardingSchema } from "@/app/lib/schema";
import { updateUser } from "@/actions/user";

const OnboardingForm = ({ industries, initialData }) => {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const isEditMode = !!initialData?.industry;

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
  } = useFetch(updateUser);

  // Parse industry format: "tech-software-development" -> { industry: "tech", subIndustry: "Software Development" }
  const parseIndustry = (industryString) => {
    if (!industryString) return { industry: null, subIndustry: null };

    const parts = industryString.split("-");
    if (parts.length < 2) return { industry: null, subIndustry: null };

    const industryId = parts[0];
    const subIndustrySlug = parts.slice(1).join("-");

    // Find the industry to get the subIndustry name
    const industryObj = industries.find((ind) => ind.id === industryId);
    if (!industryObj) return { industry: null, subIndustry: null };

    // Find the subIndustry by matching the slug
    const subIndustry = industryObj.subIndustries.find(
      (sub) => sub.toLowerCase().replace(/ /g, "-") === subIndustrySlug
    );

    return {
      industry: industryId,
      subIndustry: subIndustry || null,
    };
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      industry: "",
      subIndustry: "",
      experience: "",
      skills: "",
      bio: "",
    },
  });

  // Load initial data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      const { industry: industryId, subIndustry: subIndustryName } = parseIndustry(initialData.industry);
      
      if (industryId) {
        const industryObj = industries.find((ind) => ind.id === industryId);
        if (industryObj) {
          setSelectedIndustry(industryObj);
          setValue("industry", industryId);
          if (subIndustryName) {
            setValue("subIndustry", subIndustryName);
          }
        }
      }

      if (initialData.experience !== null && initialData.experience !== undefined) {
        setValue("experience", initialData.experience.toString());
      }

      if (initialData.skills && initialData.skills.length > 0) {
        setValue("skills", initialData.skills.join(", "));
      }

      if (initialData.bio) {
        setValue("bio", initialData.bio);
      }
    }
  }, [initialData, industries, setValue]);

  const onSubmit = async (values) => {
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;

      await updateUserFn({
        ...values,
        industry: formattedIndustry,
      });
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  useEffect(() => {
    if (updateResult?.success && !updateLoading) {
      toast.success(isEditMode ? "Profile updated successfully!" : "Profile completed successfully!");
      router.push("/dashboard");
      router.refresh();
    }
  }, [updateResult, updateLoading, isEditMode, router]);

  const watchIndustry = watch("industry");

  return (
    <div className="flex items-center justify-center min-h-screen bg-cream py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <CardTitle className="text-4xl md:text-5xl font-black text-charcoal logo-font text-center">
            {isEditMode ? "EDIT YOUR PROFILE" : "COMPLETE YOUR PROFILE"}
          </CardTitle>
          <CardDescription className="text-center text-base md:text-lg font-semibold text-charcoal">
            {isEditMode
              ? "Update your profile information to get personalized career insights and recommendations."
              : "Select your industry to get personalized career insights and recommendations."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={watchIndustry || ""}
                onValueChange={(value) => {
                  setValue("industry", value);
                  setSelectedIndustry(
                    industries.find((ind) => ind.id === value)
                  );
                  setValue("subIndustry", "");
                }}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Industries</SelectLabel>
                    {industries.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-demon-red font-semibold">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {watchIndustry && (
              <div className="space-y-2">
                <Label htmlFor="subIndustry">Specialization</Label>
                <Select
                  value={watch("subIndustry") || ""}
                  onValueChange={(value) => setValue("subIndustry", value)}
                >
                  <SelectTrigger id="subIndustry">
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Specializations</SelectLabel>
                      {selectedIndustry?.subIndustries.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.subIndustry && (
                  <p className="text-sm text-demon-red font-semibold">
                    {errors.subIndustry.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                {...register("experience")}
              />
              {errors.experience && (
                <p className="text-sm text-demon-red font-semibold">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., Python, JavaScript, Project Management"
                {...register("skills")}
              />
              <p className="text-sm text-charcoal/70 font-medium">
                Separate multiple skills with commas
              </p>
              {errors.skills && (
                <p className="text-sm text-demon-red font-semibold">{errors.skills.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your professional background..."
                className="h-32"
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-sm text-demon-red font-semibold">{errors.bio.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditMode ? "Update Profile" : "Complete Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
