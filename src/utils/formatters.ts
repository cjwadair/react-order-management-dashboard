export function pluralizeWord(word: string) {
  if (word.endsWith('s')) {
    return `${word}es`
  }

  if (word.endsWith('y') && word.length > 1) {
    const previousChar = word[word.length - 2].toLowerCase()
    if (!'aeiou'.includes(previousChar)) {
      return `${word.slice(0, -1)}ies`
    }
  }

  return `${word}s`
}

export function capitalizeWords(text: string) {
  return text
    .split(" ")
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : "")
    .join(" ");
}

export function formattedDate(date: Date) {
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}
