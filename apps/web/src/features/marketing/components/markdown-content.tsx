import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  h1: (props) => <h2 className="font-display text-2xl font-bold text-heading" {...props} />,
  h2: (props) => <h2 className="font-display text-xl font-bold text-heading" {...props} />,
  h3: (props) => <h3 className="font-display text-lg font-bold text-heading" {...props} />,
  p: (props) => <p className="leading-relaxed text-foreground/80" {...props} />,
  a: (props) => <a className="font-semibold text-accent underline underline-offset-2" {...props} />,
  ul: (props) => <ul className="list-disc space-y-1 pl-5 text-foreground/80" {...props} />,
  ol: (props) => <ol className="list-decimal space-y-1 pl-5 text-foreground/80" {...props} />,
  strong: (props) => <strong className="font-semibold text-heading" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-4 border-accent bg-secondary/40 py-2 pl-4 italic text-foreground/70" {...props} />
  ),
  code: (props) => <code className="rounded bg-secondary px-1.5 py-0.5 text-sm text-heading" {...props} />,
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="rounded-brand" alt="" {...props} />
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-4">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
