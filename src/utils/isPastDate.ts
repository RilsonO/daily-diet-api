function isPastDate(value: string) {
  const [day, month, year] = value.split('/').map(Number)
  const providedDate = new Date(year, month - 1, day)
  const currentDate = new Date()
  const timezoneOffsetMinutes = currentDate.getTimezoneOffset()
  currentDate.setMinutes(currentDate.getMinutes() - timezoneOffsetMinutes)

  return providedDate <= currentDate
}

export { isPastDate }
