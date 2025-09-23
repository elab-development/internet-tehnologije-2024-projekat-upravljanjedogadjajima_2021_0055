export default function EventCard({ name, starts_at, onClick, selected = false }) {
  const { day, time } = formatStarts(starts_at);

  return (
    <button
      type="button"
      className={`event-card ${selected ? "is-selected" : ""}`}
      onClick={onClick}
    >
      <div className="event-title">{name}</div>
      <div className="event-when">
        <div className="event-day">{day}</div>
        <div className="event-time">{time}</div>
      </div>
    </button>
  );
}

// "2025-09-15 14:00:00" → { day: "Monday", time: "15:30" }
function formatStarts(value) {
  const str = typeof value === "string" ? value.replace(" ", "T") : value;
  const d = new Date(str);
  if (isNaN(d)) return { day: "-", time: "--:--" };
  const day = d.toLocaleDateString("en-US", { weekday: "long" });    // "Monday"
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); // 24h "15:30"
  return { day, time };
}
