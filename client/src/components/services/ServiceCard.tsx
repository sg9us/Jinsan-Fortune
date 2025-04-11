import { useLocation } from "wouter";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  color: string;
}

export function ServiceCard({ icon: Icon, title, description, path, color }: ServiceCardProps) {
  const [_, navigate] = useLocation();

  return (
    <Card 
      className="mb-4 cursor-pointer hover:shadow-md transition-shadow service-card"
      onClick={() => navigate(path)}
    >
      <CardContent className="p-4">
        <div className="flex items-center">
          <div 
            className={`w-12 h-12 rounded-full flex items-center justify-center mr-4`}
            style={{ backgroundColor: `${color}/10`, color }}
          >
            <Icon className="text-xl" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-neutral-500">{description}</p>
          </div>
          <div className="text-neutral-400">
            <ChevronRight />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
