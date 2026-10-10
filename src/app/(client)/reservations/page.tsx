import Header from "@/components/shared/Header";
import ReservationList from "@/features/reservations/components/ReservationList";

export default function ReservationsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header role="client" />
      <ReservationList />
    </div>
  );
}