export function SectionHead({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-h4">{title}</h2>
      <p className="text-small text-ink-muted">{description}</p>
    </div>
  );
}
