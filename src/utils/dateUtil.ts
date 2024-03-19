// Date Util Class

const HOUR_24 = 24 * 60 * 60
export default class DateUtil {
  static getNewUTCDate() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'UTC' }))
  }

  static getNewUTC8Date() {
    const now = this.getNewUTCDate()
    return now.setHours(now.getHours() + 8)
  }

  static getNewDate() {
    return new Date()
  }

  //yyyymmdd
  static getDayFormat(time: Date) {
    // return '20240202'
    if (time == null) {
      return ''
    } else {
      const year = time.getFullYear()
      const month = time.getMonth() + 1
      const day = time.getDate()
      return `${year}${month < 10 ? '0' + month : month}${
        day < 10 ? '0' + day : day
      }`
    }
  }
  static getCurrentDayFormat() {
    return DateUtil.getDayFormat(new Date())
  }

  static getDaySplitFormat(time: Date) {
    if (time == null) {
      return ''
    } else {
      const year = time.getFullYear()
      const month = time.getMonth() + 1
      const day = time.getDate()
      return `${year}-${month < 10 ? '0' + month : month}-${
        day < 10 ? '0' + day : day
      }`
    }
  }

  static getCurrentSeconds() {
    return new Date().getTime() / 1000
  }

  static getSecondTimeStamp(date: Date) {
    return date.getTime() / 1000
  }
  static getDateOfMinuteBefore(minute: number) {
    const date = new Date()
    date.setMinutes(date.getMinutes() - minute)
    return date
  }

  static getUTCDateOfMinuteBefore(minute: number) {
    const date = DateUtil.getNewUTCDate()
    date.setMinutes(date.getMinutes() - minute)
    return date
  }

  static getDateDayBefore(day: number) {
    const date = new Date()
    date.setDate(date.getDate() - day)
    return date
  }

  static getDateHourBefore(hour: number) {
    const date = new Date()
    date.setHours(date.getHours() - hour)
    return date
  }

  static getDateDayBeforeWithDate(date: Date, day: number) {
    const newDate = new Date(date.getTime())
    newDate.setDate(newDate.getDate() - day)
    return newDate
  }

  static getDatePairBetween8Clock(): Date[] {
    const currentDayFormat = DateUtil.getDaySplitFormat(new Date())
    const currentDay8Clock = new Date(`${currentDayFormat} 00:00:00`)
    const yesterday8Clock = DateUtil.getDateDayBeforeWithDate(
      currentDay8Clock,
      1,
    )
    return [yesterday8Clock, currentDay8Clock]
  }

  static getDatePairBetweenTimeStamp(): number[] {
    const date = new Date()
    const currentDayFormat = DateUtil.getDaySplitFormat(date)
    const currentDay = new Date(`${currentDayFormat} 00:00:00`)
    const yesterday = DateUtil.getDateDayBeforeWithDate(currentDay, 1)
    return [
      this.getSecondTimeStamp(yesterday),
      this.getSecondTimeStamp(currentDay),
    ]
  }

  static getToday0ClockSecondTimestamp(): number {
    const currentDayFormat = DateUtil.getDaySplitFormat(new Date())
    const currentDay8Clock = new Date(`${currentDayFormat} 00:00:00`)
    return currentDay8Clock.getTime() / 1000
  }

  static getYestarday0ClockSecondTimestamp(): number {
    const yestarday = DateUtil.getDateDayBefore(1)
    const currentDayFormat = DateUtil.getDaySplitFormat(yestarday)
    const currentDay8Clock = new Date(`${currentDayFormat} 00:00:00`)
    return currentDay8Clock.getTime() / 1000
  }

  static isDiff24Hour(startTime: number, endTime: number): boolean {
    return Math.abs(endTime - startTime) > HOUR_24
  }
}
