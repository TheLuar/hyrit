'use strict'


// Dependences

import { TYPE_CELL, TYPE_PROTEIN } from '../consts.js'
import { Singleton } from '../utils/Singleton.js'
import { DataManager } from '../managers/DataManager.js'
import { EntitiesManager } from '../managers/EntitiesManager.js'
import { Vector } from '../utils/Vector.js'
import { circleCollision } from '../utils/Utils.js'


// General

let dataM, entitiesM


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

	tickUpdate_protein ()
	{
		if (!this.hasEnoughtMass())
		{
			entitiesM.kill(this.entity)
			return
		}

		this.grow()
		this.rotate()
		this.tryToBeCell()
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
			const { pos, target, mass, scope } = this.entity

			const targetDied = !(this.targetIs('place') || target.alive)
			const backToWorld = this.targetIs('place') && withinWorld
			const targetStronger = this.targetIs(TYPE_CELL) && (mass <= target.mass)
			const outOfRange = this.targetIs(TYPE_CELL) && !circleCollision(pos.x, target.pos.x, pos.y, target.pos.y, scope * 2, target.radius).collides

			if (targetDied || backToWorld || targetStronger || outOfRange)
			{
				this.entity.target = null
			}
			else
			{
				this.faceTowards(target)
			}
		}
		else
		{
			if (!withinWorld)
			{
				// Create 'place' target to make cell go back to world

				const radii = Math.random() * Math.PI * 2
				const x = Math.cos(radii) * Math.random() * dataM.size / 2
				const y = Math.sin(radii) * Math.random() * dataM.size / 2

				this.entity.target = {
					type: 'place',
					pos: Vector.new(x, y)
				}
			}
			else if (Math.random() > 0.99)
			{
				const { pos, scope } = this.entity
				const possibleTargets = dataM.entityList().filter(t =>
				{
					const collision = circleCollision(pos.x, t.pos.x, pos.y, t.pos.y, scope, t.radius)

					if (!collision.collides) return false
					if (t.type === TYPE_CELL)
					{
						if (t.mass > this.entity.mass * 0.9) return false
						if (t.mass < this.entity.mass * 0.1) return false
					}
					
					return true
				})

				this.entity.target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)]
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
		this.entity.mass *= this.entity.state === 'chasing' ? 0.9995 : 0.9999
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

		const cells = dataM.getEntitiesList(TYPE_CELL).filter(b => b.mass < a.mass)
		const prots = dataM.getEntitiesList(TYPE_PROTEIN)

		for (const b of cells)
		{
			const collision = circleCollision(a.pos.x, b.pos.x, a.pos.y, b.pos.y, a.radius, b.radius)

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

		for (const b of prots)
		{
			const collision = circleCollision(a.pos.x, b.pos.x, a.pos.y, b.pos.y, a.radius, b.radius)

			if (collision.collides)
			{
				a.mass += b.mass
				b.mass = 0
			}
		}
	}

	hasEnoughtMass ()
	{
		const { type } = this.entity
		if (type === TYPE_CELL) return this.entity.mass >= 1
		if (type === TYPE_PROTEIN) return this.entity.mass > 0
	}

	rotate ()
	{
		const { dir, rotationDir } = this.entity

		let radii = Math.atan2(dir.y, dir.x) + 0.005 * rotationDir
		
		if (radii >  Math.PI) radii -= Math.PI
		if (radii < -Math.PI) radii += Math.PI

		dir.x = Math.cos(radii)
		dir.y = Math.sin(radii)
	}

	collisionsUpdate_protein () {}

	tryToBeCell ()
	{
		if (Math.random() < 0.999) return

		entitiesM.create(TYPE_CELL, this.entity)
		entitiesM.kill(this.entity)
	}

	grow ()
	{
		this.entity.mass += this.entity.mass < 1 ? 1 : 1 / this.entity.mass ** 3
	}
}
