import PricingManager from "@/components/admin/pricing-manager";

export default function PricingPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Configure Pricing Rules</h1>
        <p className="text-muted-foreground mt-1">
          Set peak and off-peak pricing for each lot and vehicle type.
        </p>
      </div>
      <PricingManager />
    </div>
  );
}
