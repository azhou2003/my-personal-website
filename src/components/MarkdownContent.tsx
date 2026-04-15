type MarkdownContentProps = {
  html: string;
};

export default function MarkdownContent({ html }: MarkdownContentProps) {
  return (
    <article
      className="markdown-content prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
