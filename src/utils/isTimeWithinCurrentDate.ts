function isTimeWithinCurrentDate(time: string, currentDate: Date): boolean {
  const [currentYear, currentMonth, currentDay] = currentDate
    .toISOString()
    .split('T')[0]
    .split('-')
  const [hour, minute] = time.split(':')
  const inputDate = new Date(
    Number(currentYear),
    Number(currentMonth) - 1,
    Number(currentDay),
    Number(hour),
    Number(minute),
  )

  return inputDate <= currentDate
}

export { isTimeWithinCurrentDate }
