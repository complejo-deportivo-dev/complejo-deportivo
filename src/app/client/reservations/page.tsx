import Header from "@/components/shared/Header";
import ReservationList from "@/features/reservations/components/ReservationList";

export default function ReservationsPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header role="client" />
      <ReservationList />
    </div>
  );
}