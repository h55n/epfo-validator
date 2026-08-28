export function formatIndianCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Not updated'
  const [d, m, y] = dateStr.split('/')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`
}
