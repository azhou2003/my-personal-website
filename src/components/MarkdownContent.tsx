type MarkdownContentProps = {
  html: string;
};

export default function MarkdownContent({ html }: MarkdownContentProps) {
  return (
    <article
      className="markdown-content prose prose-neutral dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
