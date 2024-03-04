export default function (params) {
  let url = ''
  const keys = Object.keys(params)
  keys.forEach((key, index) => {
    url += `${key}=${params[key]}`
    if (index !== keys.length - 1) {
      url = `${url}&`
    }
  })
  return url;
}