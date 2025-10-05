# expeditio

Rethink travel planning.

## Development

### Internal Datetime Representation

Only the first event date is represented as absolute JSON datetime string, subsequent events are minutes offset from the first event.

## Misc

**Mock**

```js
const data = [
  {
    date: '2025-10-25T14:50+08:00',
    location: 'KHH',
    transportation: [
      {
        type: 'flight',
        name: 'MM 32',
        location: 'KIX',
        duration: 245,
      }
    ],
  },
  {
    location: '梅田',
  }
]
```
