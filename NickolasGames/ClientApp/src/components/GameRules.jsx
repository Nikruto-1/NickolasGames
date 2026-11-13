/** Shared semantic rules list; game-specific CSS classes remain unchanged. */
export function GameRules({ className, listClassName, label, sections }) {
  return <details className={className}>
    <summary>{label}</summary>
    <ol className={listClassName}>
      {sections.map(section => <li key={section.title}>
        <h3>{section.title}</h3>
        <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>
      </li>)}
    </ol>
  </details>;
}
