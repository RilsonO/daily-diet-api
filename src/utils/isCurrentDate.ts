function isCurrentDate(dateString: string): boolean {
  const currentDate = new Date()
  const [day, month, year] = dateString.split('/').map(Number)

  const providedDate = new Date(year, month - 1, day)

  // Ajustar as horas, minutos, segundos e milissegundos para zero
  providedDate.setHours(0, 0, 0, 0)
  currentDate.setHours(0, 0, 0, 0)

  return providedDate.getTime() === currentDate.getTime()
}

export { isCurrentDate }
