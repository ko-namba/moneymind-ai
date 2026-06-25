type PageHeaderProps = {
  kicker?: string;
  title: string;
  description: string;
};

export function PageHeader({ kicker, title, description }: PageHeaderProps) {
  return (
    <section className="pb-4 sm:pb-8">
      {kicker && <p className="mm-kicker mb-2">{kicker}</p>}
      <h1 className="mm-title">{title}</h1>
      <p className="mm-subtitle">{description}</p>
    </section>
  );
}
