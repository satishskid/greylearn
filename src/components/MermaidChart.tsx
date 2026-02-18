"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
});

export default function MermaidChart({ chart }: { chart: string }) {
    const chartRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState("");

    useEffect(() => {
        const renderChart = async () => {
            if (chartRef.current && chart) {
                try {
                    // Generate unique ID for each chart
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, chart);
                    setSvg(svg);
                } catch (error) {
                    console.error("Mermaid rendering error:", error);
                    setSvg(`<div class="text-red-500 text-sm p-2 border border-red-500/20 rounded">Failed to render diagram</div>`);
                }
            }
        };

        renderChart();
    }, [chart]);

    return (
        <div
            ref={chartRef}
            className="my-6 p-4 bg-slate-900/50 rounded-lg flex justify-center overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
