import type { ReactNode } from "react";

function renderBlocks(content: string): ReactNode[] {
  return content
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((block, index) => {
      const lines = block.split("\n");

      if (block.startsWith("```") && block.endsWith("```")) {
        const code = block.replace(/^```[\w-]*\n?/, "").replace(/\n?```$/, "");
        return (
          <pre key={`code-${index}`} className="overflow-x-auto rounded-lg bg-[var(--color-surface-container-low)] p-4">
            <code>{code}</code>
          </pre>
        );
      }

      if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
        return (
          <ul key={`ul-${index}`} className="list-disc pl-5">
            {lines.map((line, lineIndex) => (
              <li key={`ul-${index}-${lineIndex}`}>{line.replace(/^\s*[-*]\s+/, "")}</li>
            ))}
          </ul>
        );
      }

      if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
        return (
          <ol key={`ol-${index}`} className="list-decimal pl-5">
            {lines.map((line, lineIndex) => (
              <li key={`ol-${index}-${lineIndex}`}>{line.replace(/^\s*\d+\.\s+/, "")}</li>
            ))}
          </ol>
        );
      }

      if (lines.every((line) => /^\s*>\s?/.test(line))) {
        return (
          <blockquote
            key={`quote-${index}`}
            className="border-l-2 border-[var(--color-outline-variant)] pl-4 text-[var(--color-on-surface-variant)]"
          >
            {lines.map((line) => line.replace(/^\s*>\s?/, "")).join("\n")}
          </blockquote>
        );
      }

      const heading = block.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        const text = heading[2];
        const className =
          level === 1
            ? "text-2xl font-semibold"
            : level === 2
              ? "text-xl font-semibold"
              : "text-lg font-medium";

        return (
          <div key={`heading-${index}`} className={className}>
            {text}
          </div>
        );
      }

      return (
        <p key={`p-${index}`} className="whitespace-pre-wrap">
          {block}
        </p>
      );
    });
}

export default function Markdown({ content }: { content: string }) {
  if (!content.trim()) return null;

  return (
    <div className="space-y-4 text-sm leading-7 text-[var(--color-on-surface)]">
      {renderBlocks(content)}
    </div>
  );
}
