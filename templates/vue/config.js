let baseUrl = '/'

if (process.env.NODE_ENV === 'production') {
  baseUrl = 'http://xxx/'
  if (BUILD_ENV === 'dev') {
    console.log('in DEV')
    baseUrl = 'http://xxx/'
  } else if (BUILD_ENV === 'test') {
    console.log('in TEST')
    baseUrl = 'http://xxx/'
  } else if (BUILD_ENV === 'pre') {
    console.log('in PRE')
    baseUrl = 'http://xxx/'
  }
}

export { baseUrl }
