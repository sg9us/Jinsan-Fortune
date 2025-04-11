import { useLanguage } from "@/contexts/LanguageContext";
import { BookingForm } from "@/components/booking/BookingForm";

export default function Booking() {
  const { t } = useLanguage();

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold mb-6">
        {t("bookingTitle")}
      </h2>

      <BookingForm />
    </div>
  );
}
