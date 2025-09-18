import LotManager from "@/components/admin/lot-manager";

export default function LotsPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Manage Parking Lots</h1>
        <p className="text-muted-foreground mt-1">
          View existing lots and add new ones to the system.
        </p>
      </div>
      <LotManager />
    </div>
  );
}
