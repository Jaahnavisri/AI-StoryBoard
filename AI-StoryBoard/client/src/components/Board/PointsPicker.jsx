import './PointsPicker.css';

// Scrum/Jira teams estimate in a Fibonacci-ish sequence rather than
// linear numbers -- the growing gaps force a "rough size" conversation
// instead of false precision like "is this a 6 or a 7". Sticking to
// that sequence here instead of a free-number input is the actual
// point of a points picker in real tools.
const POINT_VALUES = [1, 2, 3, 5, 8, 13, 21];

export function PointsPicker({ value, onChange }) {
  return (
    <div className="points-picker" role="group" aria-label="Story points">
      {POINT_VALUES.map((points) => (
        <button
          key={points}
          type="button"
          className={`points-chip ${value === points ? 'selected' : ''}`}
          onClick={() => onChange(value === points ? null : points)}
        >
          {points}
        </button>
      ))}
    </div>
  );
}
