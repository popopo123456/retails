let baseUrl = '/'

if (process.env.NODE_ENV === 'production') {
  baseUrl = 'https://capi-retail.dx-groups.com/'
  if (BUILD_ENV === 'DEV') {
    console.log('in DEV')
    baseUrl = 'http://dev-capi-retail.dx-groups.com/'
  } else if (BUILD_ENV === 'TEST') {
    console.log('in TEST')
    baseUrl = 'http://test-capi-retail.dx-groups.com/'
  } else if (BUILD_ENV === 'PRE') {
    console.log('in PRE')
    baseUrl = 'https://pre-capi-retail.dx-groups.com/'
  }
}

export { baseUrl }
