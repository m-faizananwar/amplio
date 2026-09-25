// A form-level error (the server said no): one line, failure colour, announced.
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-control border border-failure/30 bg-failure-soft px-3 py-2 text-small text-failure">
      {message}
    </p>
  );
}
