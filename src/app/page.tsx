import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Car, Zap, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full h-[60vh] md:h-[70vh] text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight">
            Park Smarter, Not Harder
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8 text-primary-foreground/90">
            Find and book the perfect parking spot in seconds. ParkWise offers real-time availability and smart pricing.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/dashboard">
              Find Parking Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Choose ParkWise?</h2>
            <p className="text-muted-foreground mt-2 text-lg">The future of urban parking is here.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                  <Car className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4 font-headline">Real-time Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Never circle the block again. See available car and bike spots live, with dynamic pricing to get you the best deal.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                  <Zap className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4 font-headline">Smart Slot Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our intelligent algorithm optimizes space, even fitting bikes into empty car slots to maximize availability.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                  <FileText className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4 font-headline">Intelligent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate insightful revenue and occupancy reports with AI-powered analysis to improve your operations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-background py-6">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} ParkWise. All Rights Reserved.</p>
          </div>
      </footer>
    </div>
  );
}
