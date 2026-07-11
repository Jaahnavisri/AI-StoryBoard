// The AI is prompted (see server/services/openaiService.js) to always
// reply in this shape:
//
//   Title: ...
//   Description: ...
//   Acceptance Criteria:
//   - ...
//
// This pulls title/description back out so we can save them as
// separate DB fields. It's intentionally forgiving -- if the model
// wanders off-format, we fall back to dumping everything into
// `description` rather than throwing.
export function parseStory(rawText) {
  const titleMatch = rawText.match(/Title:\s*(.+)/);
  const descMatch = rawText.match(/Description:\s*([\s\S]*?)(?=Acceptance Criteria:|$)/);
  const criteriaMatch = rawText.match(/Acceptance Criteria:\s*([\s\S]*)/);

  if (!titleMatch) {
    return { title: 'Untitled story', description: rawText.trim() };
  }

  const description = [descMatch?.[1]?.trim(), criteriaMatch ? `Acceptance Criteria:\n${criteriaMatch[1].trim()}` : null]
    .filter(Boolean)
    .join('\n\n');

  return { title: titleMatch[1].trim(), description };
}
