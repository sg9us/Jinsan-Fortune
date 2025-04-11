import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Home, 
  FileSignature,
} from "lucide-react";

export function BookingForm() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Define the form schema
  const formSchema = z.object({
    name: z.string().min(1, { message: t("required") }),
    birthdate: z.string().min(1, { message: t("required") }),
    phone: z.string().min(1, { message: t("required") })
      .refine((val) => /^[\d\-+() ]+$/.test(val), { 
        message: t("invalidPhone") 
      }),
    serviceType: z.enum(["saju", "fengshui", "naming"]),
    preferredDate: z.string().min(1, { message: t("required") }),
    preferredTime: z.string().min(1, { message: t("required") }),
    comments: z.string().optional(),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      birthdate: "",
      phone: "",
      serviceType: "saju",
      preferredDate: "",
      preferredTime: "",
      comments: "",
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      toast({
        title: t("bookingComplete"),
        duration: 3000,
      });
      
      // Reset form and redirect to home after short delay
      setTimeout(() => {
        form.reset();
        navigate("/");
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createBookingMutation.mutate(data);
  };

  // Time slot options
  const timeSlots = [
    "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Service Selection */}
        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{t("consultationType")}</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div className="relative">
                      <RadioGroupItem
                        value="saju"
                        id="service-saju"
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="service-saju"
                        className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-neutral-50 transition-colors text-center"
                      >
                        <User className="mb-2 text-neutral-500 peer-data-[state=checked]:text-primary" size={18} />
                        <span className="text-sm">{t("saju")}</span>
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <RadioGroupItem
                        value="fengshui"
                        id="service-fengshui"
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="service-fengshui"
                        className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-neutral-50 transition-colors text-center"
                      >
                        <Home className="mb-2 text-neutral-500 peer-data-[state=checked]:text-primary" size={18} />
                        <span className="text-sm">{t("fengShuiTag")}</span>
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <RadioGroupItem
                        value="naming"
                        id="service-naming"
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="service-naming"
                        className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-neutral-50 transition-colors text-center"
                      >
                        <FileSignature className="mb-2 text-neutral-500 peer-data-[state=checked]:text-primary" size={18} />
                        <span className="text-sm">{t("naming")}</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Personal Information */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthdate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("birthdate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                <FormLabel>{t("phone")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Consultation Date/Time */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="preferredDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("preferredDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("preferredTime")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectTime")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional Comments */}
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("comments")}</FormLabel>
              <FormControl>
                <Textarea 
                  rows={3} 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={createBookingMutation.isPending}
        >
          {createBookingMutation.isPending ? 
            "..." : 
            t("complete")
          }
        </Button>
      </form>
    </Form>
  );
}
