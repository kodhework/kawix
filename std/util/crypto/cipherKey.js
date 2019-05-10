
module.exports = function (password) {
	var buf = []
	buf[0] = Buffer.from(password)
	if (buf[0].length >= 32) {
		buf = buf[0].slice(0, 32)
	} else {
		buf.push(Buffer.allocUnsafe(32 - buf[0].length))
		buf[1].fill(1)
		buf = Buffer.concat(buf)
	}
	return buf
}