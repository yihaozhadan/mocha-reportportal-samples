module.exports = {
    'extension': ['js'],
    'package': './package.json',
    reporter: '@reportportal/agent-js-mocha',
    'reporter-option':[
      'endpoint=http://localhost:8080/api/v1',
      'apiKey={{the report portal api key}}',
      'launch=mocha-reportportal-sample',
      'project=poc',
      'attributes=author:hui;reportportal-sample',
    ],
    'file': [
      'test/index.spec.js',
    ]
  }