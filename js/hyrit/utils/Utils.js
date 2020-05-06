'use strict'

export const circleCollision = (x1, x2, y1, y2, r1 = 0, r2 = 0) =>
{
	const distance = Math.hypot(x1 - x2, y1 - y2) - (r1 + r2)
	const collides = distance < 0
	return { distance, collides }
}

export const randomHSL = () =>
{
	const h = Math.floor(Math.random() * 360)
	const s = 80 + Math.round(20 * Math.random())
	const l = 50 + Math.round(30 * Math.random())
	return `hsl(${ h }, ${ s }%, ${ l }%)`
}
