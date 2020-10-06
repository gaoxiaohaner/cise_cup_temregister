let formatTime = date => {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
let formatTime_day = date => {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  return [year, month, day].map(formatNumber).join('/')
}
let formatTime_day2 = date => {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  return [year, month, day].map(formatNumber).join('.')
}
let formatTime_hour = date => {
  let hour = date.getHours()
  return [hour].map(formatNumber).join('/')
}
let formatTime_time = date => {
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()
  return [hour, minute, second].map(formatNumber).join(':')
}
let formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime_day:formatTime_day,
  formatTime_time:formatTime_time,
  formatTime_hour:formatTime_hour,
  formatTime_day2:formatTime_day2,
  formatTime: formatTime
}
