export const KEYBOARD_LAYOUTS = [
  { id: "us-ansi", label: "US ANSI (QWERTY)" },
  { id: "qwertz", label: "QWERTZ" },
  { id: "azerty", label: "AZERTY" },
];

function byId(rows) {
  return new Map(rows.flat().map((definition) => [definition.id, definition]));
}

function rowWithLetterOrder(originalRow, letterIds, definitions) {
  const letters = originalRow.filter((definition) => /^[a-z]$/.test(definition.id));
  const firstLetterIndex = originalRow.findIndex((definition) => /^[a-z]$/.test(definition.id));
  const lastLetterIndex = originalRow.findLastIndex((definition) => /^[a-z]$/.test(definition.id));
  if (!letters.length || firstLetterIndex < 0 || lastLetterIndex < 0) return originalRow.map((definition) => ({ ...definition }));
  return [
    ...originalRow.slice(0, firstLetterIndex).map((definition) => ({ ...definition })),
    ...letterIds.map((id) => ({ ...definitions.get(id) })),
    ...originalRow.slice(lastLetterIndex + 1).map((definition) => ({ ...definition })),
  ];
}

export function getVisualKeyboardRowsForLayout(baseRows, layoutId = "us-ansi") {
  const rows = baseRows.map((row) => row.map((definition) => ({ ...definition })));
  if (layoutId === "us-ansi") return rows;
  const definitions = byId(baseRows);

  if (layoutId === "qwertz") {
    rows[2] = rowWithLetterOrder(baseRows[2], ["q","w","e","r","t","z","u","i","o","p"], definitions);
    rows[4] = rowWithLetterOrder(baseRows[4], ["y","x","c","v","b","n","m"], definitions);
    return rows;
  }

  if (layoutId === "azerty") {
    rows[2] = rowWithLetterOrder(baseRows[2], ["a","z","e","r","t","y","u","i","o","p"], definitions);
    rows[3] = rowWithLetterOrder(baseRows[3], ["q","s","d","f","g","h","j","k","l","m"], definitions);
    rows[4] = rowWithLetterOrder(baseRows[4], ["w","x","c","v","b","n"], definitions);
    return rows;
  }

  return rows;
}
