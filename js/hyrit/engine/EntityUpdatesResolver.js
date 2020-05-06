'use strict'


// Dependences

import { Singleton } from '../utils/Singleton.js'

import { DataManager } from '../managers/DataManager.js'

import { EntitiesManager } from '../managers/EntitiesManager.js'

import { Vector } from '../utils/Vector.js'

import { circleCollision } from '../utils/Utils.js'


// General

let dataM = null

let entitiesM = null


// Class

export const EntityUpdatesResolver = class extends Singleton
{
	constructor ()
	{
		super()

		this.entity = null
	}

	init ()
	{
		dataM = DataManager.gi()
		entitiesM = EntitiesManager.gi()
		
		this._init()
	}

	updatePosition (entity)
	{
		const handlerName = 'tickUpdate_' + entity.type

		if (typeof this[handlerName] !== 'function')
		{
			throw new Error('No controllers for entity type ' + entity.type)
		}

		this.entity = entity
		this[handlerName]()
	}

	tickUpdate_cell ()
	{
		this.decay()

		if (!this.hasEnoughtMass())
		{
			entitiesM.kill(this.entity)
			return
		}

		const withinWorld = this.withinWorldBorders()
		const hasTarget = !!this.entity.target

		if (hasTarget)
		{
			if (this.targetIs('place') && withinWorld)
			{
				this.entity.target = null
			}
			else
			{
				this.faceTowards(this.entity.target)
			}
		}
		else
		{
			if (!withinWorld)
			{
				// Create 'place' target to make cell go back to world

				const radii = Math.random() * Math.PI * 2
				const x = Math.cos(radii) * Math.random() * dataM.size
				const y = Math.sin(radii) * Math.random() * dataM.size

				this.entity.target = {
					type: 'place',
					pos: Vector.new(x, y)
				}
			}
		}

		this.move()
	}

	withinWorldBorders ()
	{
		const { pos } = this.entity
		return Math.hypot(pos.x, pos.y) < dataM.size
	}

	move ()
	{
		const { pos, dir, speed } = this.entity
		pos.x += dir.x * speed
		pos.y += dir.y * speed
	}

	decay ()
	{
		this.entity.mass *= 0.9995
	}

	faceTowards (target)
	{
		const { pos, dir } = this.entity
		const rotationRate = 0.05
		const curDir = Math.atan2(dir.y, dir.x)
		const newDir = Math.atan2(target.pos.y - pos.y, target.pos.x - pos.x)

		dir.x = Math.cos(curDir) * (1 - rotationRate) + Math.cos(newDir) * rotationRate
		dir.y = Math.sin(curDir) * (1 - rotationRate) + Math.sin(newDir) * rotationRate
	}

	targetIs (type)
	{
		return this.entity.target.type === type
	}

	updateCollisions (entity)
	{
		const handlerName = 'collisionsUpdate_' + entity.type

		if (typeof this[handlerName] !== 'function')
		{
			throw new Error('No collision updates for entity type ' + entity.type)
		}

		this.entity = entity
		this[handlerName]()
	}

	collisionsUpdate_cell ()
	{
		const a = this.entity

		const victims = dataM.entityList().filter(b => b.mass < a.mass)

		for (const b of victims)
		{
			const collision = circleCollision(a.pos.x, b.pos.x, a.pos.y, b.pos.y, a.radius, b.radius)

			window.collision = collision

			if (collision.collides)
			{
				const drain = a.mass / 100 * (Math.abs(a.mass - b.mass) / a.mass)

				if (drain > b.mass)
				{
					a.mass += b.mass
					b.mass = 0
				}
				else
				{
					a.mass += drain
					b.mass -= drain
				}
			}
		}
	}

	hasEnoughtMass ()
	{
		return this.entity.mass > 1
	}
}
