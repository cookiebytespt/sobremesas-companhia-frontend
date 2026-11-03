// Contact checks for the request form: a mobile number and/or an e-mail, at least one.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(value: string) {
  return EMAIL.test(value.trim())
}

/** 9 digits (Portuguese mobile/landline), or an international number with + / 00. */
export function isPhone(value: string) {
  const v = value.trim()
  if (!/^[+\d][\d\s().-]*$/.test(v)) return false
  const digits = v.replace(/\D/g, '')
  return v.startsWith('+') || v.startsWith('00') ? digits.length >= 9 && digits.length <= 15 : digits.length === 9
}
