export default {
  type: "object",
  properties: {
    statusCode: { type: 'number' },
    items: { type: 'Array' }
  },
  required: ['items']
} as const;
