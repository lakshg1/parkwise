import ReportGenerator from '@/components/admin/report-generator';

export default function ReportsPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Generate Parking Reports</h1>
        <p className="text-muted-foreground mt-1">
          Use our AI-powered tool to generate and analyze parking data.
        </p>
      </div>
      <ReportGenerator />
    </div>
  );
}
