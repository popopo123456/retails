import { baseUrl } from '../config'

export default {
  shop: baseUrl + 'api/retail/shelf/client/goods/queryShelfInfo',
  goods: baseUrl + 'api/retail/shelf/client/goods/queryCategoryAndGoods',
  check: baseUrl + 'api/retail/h5/order/check',
  confirm: baseUrl + 'api/retail/h5/order/confirm',
}
