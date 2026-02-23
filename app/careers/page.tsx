import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowLeft, MapPin, Clock } from 'lucide-react';

export default function CareersPage() {
  const jobs = [
    {
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build the next generation of our trading platform with React and Next.js'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create beautiful and intuitive experiences for crypto traders worldwide'
    },
    {
      title: 'Security Engineer',
      department: 'Security',
      location: 'Remote',
      type: 'Full-time',
      description: 'Protect our users and platform with industry-leading security practices'
    },
    {
      title: 'Customer Success Manager',
      department: 'Support',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help users succeed on their cryptocurrency investment journey'
    },
  ];

  return (
    <div classNazwa="min-h-screen bg-background">
      <header classNazwa="border-b border-border bg-card">
        <div classNazwa="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" classNazwa="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div classNazwa="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
              <TrendingUp classNazwa="w-4 h-4 text-primary-foreground" />
            </div>
            <span classNazwa="text-xl font-bold">CryptoVest</span>
          </Link>
          <div classNazwa="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Zaloguj się</Button>
            </Link>
            <Link href="/register">
              <Button>Zacznij</Button>
            </Link>
          </div>
        </div>
      </header>

      <main classNazwa="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" classNazwa="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft classNazwa="w-4 h-4" />
          Powrót do strony głównej
        </Link>

        <div classNazwa="mb-16">
          <h1 classNazwa="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Come build the future of finance
          </h1>
          <p classNazwa="text-xl text-muted-foreground max-w-3xl text-pretty leading-relaxed">
            Join our team of innovators building the most trusted cryptocurrency platform
          </p>
        </div>

        <section classNazwa="mb-16">
          <h2 classNazwa="text-2xl font-bold mb-8">Open positions</h2>
          
          <div classNazwa="space-y-4">
            {jobs.map((job, index) => (
              <Card key={index} classNazwa="border-2 hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div classNazwa="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div classNazwa="space-y-2">
                      <CardTitle classNazwa="text-xl">{job.title}</CardTitle>
                      <div classNazwa="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="secondary">{job.department}</Badge>
                        <span classNazwa="flex items-center gap-1">
                          <MapPin classNazwa="w-4 h-4" />
                          {job.location}
                        </span>
                        <span classNazwa="flex items-center gap-1">
                          <Clock classNazwa="w-4 h-4" />
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <Button classNazwa="w-full md:w-auto">Apply Now</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p classNazwa="text-muted-foreground leading-relaxed">{job.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section classNazwa="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-16 text-center text-primary-foreground shadow-2xl shadow-primary/20">
          <h2 classNazwa="text-3xl md:text-4xl font-bold mb-6 text-balance">
            {"Don't see a role that fits?"}
          </h2>
          <p classNazwa="text-xl opacity-90 max-w-2xl mx-auto mb-8 text-pretty leading-relaxed">
            {"We're always looking for talented people to join our team. Send us your resume and we'll be in touch."}
          </p>
          <Button size="lg" variant="secondary" classNazwa="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 px-8">
            Contact Us
          </Button>
        </section>
      </main>
    </div>
  );
}
