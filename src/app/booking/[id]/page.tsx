import BookingDetails from '@/components/booking/booking-details';

export default function BookingPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-8 px-4 md:px-6">
      <BookingDetails bookingId={params.id} />
    </div>
  );
}
