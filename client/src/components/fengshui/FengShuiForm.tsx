import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { FengShuiResults } from "./FengShuiResults";
import type { FengShuiScore } from "@shared/schema";

export function FengShuiForm() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [results, setResults] = useState<FengShuiScore | null>(null);

  // Define form schema
  const formSchema = z.object({
    address: z.string().min(1, { message: t("required") }),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  });

  // Create analysis mutation
  const analyzeFengShuiMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/fengshui/analyze", {
        ...data,
        language,
      });
      return response.json();
    },
    onSuccess: (data: FengShuiScore) => {
      setResults(data);
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    analyzeFengShuiMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardContent className="p-5">
          <p className="text-neutral-600 mb-4">
            {t("fengShuiIntro")}
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("address")}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={language === "ko" ? "서울시 강남구 테헤란로 152" : "123 Main St, New York"}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                variant="secondary"
                disabled={analyzeFengShuiMutation.isPending}
              >
                {analyzeFengShuiMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("checkScore")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {results && <FengShuiResults data={results} />}
    </div>
  );
}
