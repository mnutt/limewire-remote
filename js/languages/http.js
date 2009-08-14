hljs.LANGUAGES.http = {
  defaultMode: {
    contains: ['url'],
    keywords: { 'GET':1, 'POST':1, 'PUT':1, 'DELETE':1 },
    lexems: [hljs.IDENT_RE]
  },
  case_insensitive: false,
  modes: [
    {
      className: 'url',
      begin: '\\/', end: '$',
      contains: ['params']
    },
    {
      className: 'params',
      begin: '\\?', end: '$',
      contains: ['param']
    },
    {
      className: 'param',
      begin: '\\?', end: '='
    }
  ]
};