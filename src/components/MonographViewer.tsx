"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronRight, BookOpen, BrainCircuit } from 'lucide-react';

interface MonographSection {
    heading: string;
    content: string;
    key_concepts?: string[];
    subsections?: MonographSection[];
}

interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

interface MonographData {
    title: string;
    summary: string;
    sections: MonographSection[];
    quiz: QuizQuestion[];
}

interface MonographViewerProps {
    data: MonographData;
}

export function MonographViewer({ data }: MonographViewerProps) {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);

    const toggleSection = (heading: string) => {
        setActiveSection(activeSection === heading ? null : heading);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {data.title}
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400 max-w-2xl">
                        {data.summary}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowQuiz(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
              ${!showQuiz ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                        <BookOpen size={16} />
                        Read
                    </button>
                    <button
                        onClick={() => setShowQuiz(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
              ${showQuiz ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                        <BrainCircuit size={16} />
                        Quiz
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 md:p-8">
                {!showQuiz ? (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {data.sections.map((section, idx) => (
                            <SectionView key={idx} section={section} isActive={activeSection === section.heading} onToggle={() => toggleSection(section.heading)} />
                        ))}
                    </div>
                ) : (
                    <QuizView questions={data.quiz} />
                )}
            </div>
        </div>
    );
}

function SectionView({ section, isActive, onToggle }: { section: MonographSection; isActive: boolean; onToggle: () => void }) {
    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md bg-white dark:bg-zinc-900">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 md:p-6 text-left bg-zinc-50/50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
            >
                <h2 className="text-xl font-semibold">{section.heading}</h2>
                {isActive ? <ChevronDown className="text-zinc-400" /> : <ChevronRight className="text-zinc-400" />}
            </button>

            {isActive && (
                <div className="p-4 md:p-6 border-t border-zinc-100 dark:border-zinc-800/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300">
                        <ReactMarkdown>{section.content}</ReactMarkdown>
                    </div>

                    {section.key_concepts && section.key_concepts.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">Key Concepts</span>
                            <div className="flex flex-wrap gap-2">
                                {section.key_concepts.map((concept, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                                        {concept}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {section.subsections && section.subsections.length > 0 && (
                        <div className="mt-8 space-y-4 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800">
                            {section.subsections.map((sub, idx) => (
                                <div key={idx} className="mt-4">
                                    <h3 className="text-lg font-medium mb-2">{sub.heading}</h3>
                                    <div className="prose dark:prose-invert text-sm">
                                        <ReactMarkdown>{sub.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function QuizView({ questions }: { questions: QuizQuestion[] }) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [results, setResults] = useState<Record<number, boolean | null>>({});

    const handleSelect = (qIdx: number, option: string) => {
        if (results[qIdx] !== undefined) return; // Prevent changing after revealing
        setAnswers({ ...answers, [qIdx]: option });
    };

    const checkAnswer = (qIdx: number) => {
        const isCorrect = answers[qIdx] === questions[qIdx].answer;
        setResults({ ...results, [qIdx]: isCorrect });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Test Your Knowledge</h2>
            {questions.map((q, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-medium mb-4">{idx + 1}. {q.question}</h3>
                    <div className="space-y-3">
                        {q.options.map((option, oIdx) => (
                            <button
                                key={oIdx}
                                onClick={() => handleSelect(idx, option)}
                                disabled={results[idx] !== undefined}
                                className={`w-full text-left p-3 rounded-lg border transition-all duration-200
                                    ${answers[idx] === option
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'}
                                    ${results[idx] !== undefined && option === q.answer ? 'bg-green-100 border-green-500 text-green-800' : ''}
                                    ${results[idx] === false && answers[idx] === option ? 'bg-red-100 border-red-500 text-red-800' : ''}
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {results[idx] !== undefined && option === q.answer && <span className="text-green-600 text-sm font-bold">✓</span>}
                                    {results[idx] === false && answers[idx] === option && <span className="text-red-500 text-sm font-bold">✗</span>}
                                </div>
                            </button>
                        ))}
                    </div>

                    {answers[idx] && results[idx] === undefined && (
                        <button
                            onClick={() => checkAnswer(idx)}
                            className="mt-4 w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            Check Answer
                        </button>
                    )}

                    {results[idx] !== undefined && (
                        <div className={`mt-4 p-4 rounded-lg text-sm ${results[idx] ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
                            <p className="font-bold mb-1">{results[idx] ? 'Correct!' : 'Incorrect'}</p>
                            <p>{q.explanation}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
