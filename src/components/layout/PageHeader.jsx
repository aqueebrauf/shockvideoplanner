export default function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col gap-1 pb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
