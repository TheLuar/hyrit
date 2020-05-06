'use strict'

export const Vector = class
{
	static new (x = 0, y = 0)
	{
		return { x, y }
	}

	static from (obj = {})
	{
		const { x = 0, y = 0 } = obj
		return { x, y }
	}

	static random (scaleX = 1, scaleY = scaleX)
	{
		const radii = Math.random() * Math.PI * 2

		return {
			x: Math.cos(radii) * scaleX,
			y: Math.sin(radii) * scaleY
		}
	}
}
