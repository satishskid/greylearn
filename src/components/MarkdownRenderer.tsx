"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyBlock, dracula } from "react-code-blocks"; // We can implement code copy block later
import dynamic from "next/dynamic";

// Dynamic import for Mermaid to avoid SSR
const MermaidChart = dynamic(() => import("./MermaidChart"), {
    ssr: false,
});

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="markdown-body prose prose-slate prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";

                        if (language === "mermaid") {
                            return <MermaidChart chart={String(children).replace(/\n$/, "")} />;
                        }

                        return match ? (
                            <div className="bg-slate-900 rounded-lg overflow-hidden my-4 border border-slate-700">
                                <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">
                                    {language}
                                </div>
                                <pre className="!bg-transparent !p-4 !m-0 overflow-x-auto">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            </div>
                        ) : (
                            <code className={`${className} bg-slate-800 px-1.5 py-0.5 rounded text-amber-200`} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
