import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, MapPin, Globe, Award, BookOpen, Clock, Heart } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            <main className="max-w-4xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">About Your Teacher</h1>
                    <p className="text-xl text-slate-600 font-medium">Waleed Mahrous</p>
                    <div className="flex justify-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 gap-1">
                            <Globe className="w-3 h-3" /> Native Arabic Speaker
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 gap-1">
                            <Clock className="w-3 h-3" /> Fluent English
                        </span>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    {/* Hero area within card (optional, maybe a header image or pattern) */}
                    <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>

                    <div className="p-8 md:p-12 space-y-10 -mt-12">
                        {/* Profile Intro */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative">
                            <p className="text-lg leading-relaxed text-slate-700">
                                Waleed Mahrous is an Egyptian native Arabic speaker with a diverse academic and professional background.
                                He combines a scientific mindset with deep Islamic learning to provide a structured and comprehensive educational experience.
                                Passionate about sharing knowledge, he specializes in teaching Quran, Tajweed, and Islamic Studies to non-Arabic speakers throughout the world.
                            </p>
                        </div>

                        {/* Education Grid */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <GraduationCap className="w-6 h-6 text-indigo-500" /> Academic & Islamic Education
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-slate-50 border-0 hover:bg-slate-100 transition-colors">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-slate-900 mb-1">Environmental Science</h3>
                                        <p className="text-sm text-slate-600 mb-2">Master of Science (M.Sc.)</p>
                                        <p className="text-xs text-slate-500">Mie University, Japan (2018)</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-50 border-0 hover:bg-slate-100 transition-colors">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-slate-900 mb-1">Veterinary Medicine</h3>
                                        <p className="text-sm text-slate-600 mb-2">Bachelor's Degree</p>
                                        <p className="text-xs text-slate-500">Cairo University, Egypt (2007)</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-50 border-0 hover:bg-slate-100 transition-colors">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-slate-900 mb-1">Islamic Sharia</h3>
                                        <p className="text-sm text-slate-600 mb-2">Diploma Program</p>
                                        <p className="text-xs text-slate-500">Alwasatiyyah Islamic Institute (under Al-Azhar University)</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-50 border-0 hover:bg-slate-100 transition-colors">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-slate-900 mb-1">Zad Academy</h3>
                                        <p className="text-sm text-slate-600 mb-2">Online Course (Arabic & English)</p>
                                        <p className="text-xs text-slate-500">Completed with Excellence</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Experience & Current Work */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Award className="w-6 h-6 text-amber-500" /> Professional Career
                                </h2>
                                <p className="text-slate-700 leading-relaxed">
                                    Currently working for a Japanese company innovating in biofuel production from microalgae, Waleed brings professional discipline and cross-cultural communication skills to his teaching practice.
                                </p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-emerald-500" /> Teaching Experience
                                </h2>
                                <p className="text-slate-700 leading-relaxed">
                                    Experienced in teaching Quran, Tajweed rules, Arabic, and Islamic studies to non-Arabic speakers online. While currently working towards memorizing the entire Quran, he possesses proper knowledge of Tajweed rules and strives for excellence in recitation.
                                </p>
                            </div>
                        </div>

                        {/* Community Work */}
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <h2 className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-indigo-600" /> Community Service
                            </h2>
                            <p className="text-indigo-800 leading-relaxed">
                                Waleed holds regular, free educational activities at his local mosque, teaching three subjects to both elders and children.
                                His goal is to help non-Arabic speakers learn Islam properly according to the Sunnah of the Prophet Muhammad (peace be upon him) and his companions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="text-center">
                    <a href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">
                        &larr; Back to Home
                    </a>
                </div>
            </main>
        </div>
    );
}
