import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { insertReviewSchema } from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ onSuccess, onCancel }: ReviewFormProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Define the form schema with Zod
  const formSchema = insertReviewSchema.extend({
    name: z.string().min(1, { message: t("required") }),
    serviceType: z.string().min(1, { message: t("required") }),
    rating: z.number().min(1, { message: t("ratingRequired") }).max(5),
    content: z.string().min(5, { message: t("reviewTooShort") }),
  });

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      serviceType: "",
      rating: 0,
      content: "",
    },
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/reviews", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("reviewSubmitted"),
        description: t("thankYouForReview"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: t("errorSubmittingReview"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createReviewMutation.mutate({ ...data, rating });
  };

  // Service types for dropdown
  const serviceTypes = [
    { value: "saju", label: language === "ko" ? "사주 상담" : "Saju Reading" },
    { value: "naming", label: language === "ko" ? "작명 상담" : "Name Analysis" },
    { value: "fengshui", label: language === "ko" ? "풍수 컨설팅" : "Feng Shui Consultation" },
    { value: "tarot", label: language === "ko" ? "타로 상담" : "Tarot Reading" },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-4">{t("writeReview")}</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("yourName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("enterYourName")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("serviceType")}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectService")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rating"
              render={() => (
                <FormItem>
                  <FormLabel>{t("rating")}</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={`cursor-pointer ${
                            i < (hoverRating || rating) 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-neutral-300"
                          }`}
                          onClick={() => {
                            setRating(i + 1);
                            form.setValue("rating", i + 1);
                          }}
                          onMouseEnter={() => setHoverRating(i + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                        />
                      ))}
                      <span className="ml-2 text-sm text-neutral-600">
                        {rating > 0 
                          ? `${rating}/5` 
                          : t("selectRating")}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("yourReview")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t("shareYourExperience")} 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
              >
                {t("cancel")}
              </Button>
              <Button 
                type="submit"
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? t("submitting") : t("submitReview")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}