import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Globe, GraduationCap } from "lucide-react";

export default function Home() {
  const services = [
    {
      id: 'Quran',
      title: 'Qur’an Recitation',
      description: 'Master Tajweed and recitation with expert teachers.',
      icon: BookOpen,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-500',
    },
    {
      id: 'IslamicStudies',
      title: 'Islamic Studies',
      description: 'Deepen your understanding of Fiqh, Seerah, and more.',
      icon: GraduationCap,
      color: 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-500',
    },
    {
      id: 'Arabic',
      title: 'Arabic Language',
      description: 'Learn Arabic from scratch or improve your fluency.',
      icon: Globe,
      color: 'bg-sky-50 text-sky-900 border-sky-200 hover:border-sky-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-8 font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}>
      </div>

      <main className="max-w-5xl w-full z-10 space-y-16 text-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            What would you like to learn?
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            Choose a subject to begin your journey of knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {services.map((service) => (
            <Link key={service.id} href={`/book?service=${service.id}`} className="block group decoration-0">
              <Card className={`h-full transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl border-2 cursor-pointer ${service.color}`}>
                <CardHeader className="items-center pb-6 pt-8">
                  <div className="p-5 rounded-full bg-white/60 mb-6 shadow-sm ring-1 ring-black/5">
                    <service.icon className="w-10 h-10 opacity-90" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center font-medium opacity-90 text-current text-base px-2">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <footer className="absolute bottom-6 text-sm text-slate-400 font-medium">
        © 2025 Islamic Education Platform. All rights reserved.
      </footer>
    </div>
  );
}
