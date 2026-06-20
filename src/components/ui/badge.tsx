type BadgeVariant = "gray" | "blue" | "green" | "yellow" | "red" | "purple";

const variants: Record<BadgeVariant, string> = {
  purple: "badge-purple",
  blue:   "badge-blue",
  green:  "badge-green",
  yellow: "badge-yellow",
  red:    "badge-red",
  gray:   "badge-gray",
};

export function Badge({ label, variant = "gray" }: { label: string; variant?: BadgeVariant }) {
  return <span className={variants[variant]}>{label}</span>;
}
