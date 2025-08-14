type Labels = Record<string, string | number | boolean>

type CounterKey = string

function keyFor(name: string, labels?: Labels): CounterKey {
  if (!labels) return name
  const sorted = Object.keys(labels).sort().map(k => `${k}=${String(labels[k])}`).join(',')
  return `${name}{${sorted}}`
}

const counters = new Map<CounterKey, number>()

export function inc(name: string, labels?: Labels, value = 1) {
  const key = keyFor(name, labels)
  counters.set(key, (counters.get(key) || 0) + value)
}

export function getCountersSnapshot() {
  const result: Array<{ name: string; labels: Labels; value: number }> = []
  for (const [key, value] of counters.entries()) {
    const match = key.match(/^(.*?)\{(.*)\}$/)
    if (!match) {
      result.push({ name: key, labels: {}, value })
    } else {
      const name = match[1]
      const labelsStr = match[2]
      const labels: Labels = {}
      if (labelsStr) {
        for (const pair of labelsStr.split(',')) {
          const [k, v] = pair.split('=')
          labels[k] = v
        }
      }
      result.push({ name, labels, value })
    }
  }
  return result
}
