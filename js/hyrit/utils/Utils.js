'use strict'

export const circleCollision = (x1, x2, y1, y2, r1 = 0, r2 = 0) =>
{
	const distance = Math.hypot(x1 - x2, y1 - y2) - (r1 + r2)
	const collides = distance < 0
	return { distance, collides }
}
