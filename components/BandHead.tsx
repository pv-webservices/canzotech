export function BandHead({
  index,
  label,
  title,
  description,
  action,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="band-head" data-reveal="up">
      <div className="band-head-copy">
        <span className="mono index-label">
          {index} / {label}
        </span>
        <h2 className="display display-l">{title}</h2>
        {description ? <p className="lede">{description}</p> : null}
      </div>
      {action ? <div className="band-head-action">{action}</div> : null}
    </div>
  );
}
