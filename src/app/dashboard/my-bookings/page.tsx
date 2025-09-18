import MyBookingsList from '@/components/dashboard/my-bookings-list';

export default function MyBookingsPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">My Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your active and past parking bookings.
        </p>
      </div>
      <MyBookingsList />
    </div>
  );
}
