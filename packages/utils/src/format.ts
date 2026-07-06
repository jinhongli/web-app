const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export function formatDateTime(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return dateTimeFormatter.format(date)
}

export function truncate(value: string, max = 32): string {
  if (value.length <= max) {
    return value
  }
  return `${value.slice(0, max - 1)}…`
}
