export function AliasScoreboard({ state, copy }) {
  return <aside className="alias-scores" aria-label={copy.points}>
    <h3>{copy.points}</h3><p>{copy.target}: {state.target}</p>
    <table>
      <thead><tr><th scope="col">{copy.team}</th><th scope="col">{copy.points}</th></tr></thead>
      <tbody>{state.teams.map((item, index) => <tr key={item.id}
        aria-current={index === state.activeIndex ? 'true' : undefined}>
        <th scope="row"><span>{item.name}</span><small>{item.players.map(player => player.name).join(', ')}</small></th>
        <td>{item.points}</td>
      </tr>)}</tbody>
    </table>
  </aside>;
}
