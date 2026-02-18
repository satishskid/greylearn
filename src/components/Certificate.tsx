import React from 'react';
import { Award, CheckCircle, Calendar } from 'lucide-react';

interface CertificateProps {
    studentName: string;
    courseTitle: string;
    completionDate: string;
    instructorName?: string;
}

export default function Certificate({ studentName, courseTitle, completionDate, instructorName = "GreyLearn Academy" }: CertificateProps) {
    return (
        <div className="w-full max-w-4xl mx-auto bg-white text-slate-900 aspect-[1.414] shadow-2xl relative overflow-hidden border-[16px] border-slate-900 flex flex-col items-center justify-center p-12 text-center select-none print:shadow-none print:border-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '32px 32px' }}>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full h-full border-4 border-slate-200 p-12">
                <div className="mb-8 p-4 bg-blue-600 rounded-full text-white shadow-lg">
                    <Award className="w-16 h-16" />
                </div>

                <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight uppercase">
                    Certificate of Completion
                </h1>

                <p className="text-xl text-slate-500 font-medium tracking-wide mb-12 uppercase">
                    This certifies that
                </p>

                <h2 className="text-6xl font-script text-blue-600 mb-8 font-bold italic" style={{ fontFamily: 'Georgia, serif' }}>
                    {studentName}
                </h2>

                <p className="text-xl text-slate-500 mb-6 max-w-2xl leading-relaxed">
                    has successfully completed the comprehensive course requirements for
                </p>

                <h3 className="text-4xl font-bold text-slate-900 mb-16 max-w-3xl leading-tight">
                    {courseTitle}
                </h3>

                <div className="mt-auto w-full flex items-end justify-between px-16">
                    <div className="text-center">
                        <div className="border-b-2 border-slate-300 w-64 mb-2"></div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Date Issued</p>
                        <div className="flex items-center justify-center gap-2 mt-1 text-slate-900 font-medium">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            {completionDate}
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center w-24 h-24 rounded-full border-4 border-slate-200 mb-2 mx-auto bg-slate-50" >
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Verified Integrity</p>
                    </div>

                    <div className="text-center">
                        <div className="border-b-2 border-slate-300 w-64 mb-2">
                            <img src="/signature.png" alt="Signature" className="h-12 mx-auto opacity-0" /> {/* Placeholder */}
                            <div className="font-serif text-2xl italic text-slate-800">GreyBrain Team</div>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Instructor</p>
                        <p className="text-slate-900 font-medium mt-1">{instructorName}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
