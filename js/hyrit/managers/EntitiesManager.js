'use strict'


// Packages

import { TYPE_CELL, TYPE_PROTEIN } from '../consts.js'
import { HyritConfig } from '../HyritConfig.js'
import { randomHSL } from '../utils/Utils.js'
import { Singleton } from '../utils/Singleton.js'
import { Vector } from '../utils/Vector.js'
import { DataManager } from './DataManager.js'
import { Camera } from '../render/Camera.js'


// General

let config, dataM, camera

let entityCount = 0


// Class

export const EntitiesManager = class extends Singleton
{
	constructor ()
	{
		super()
	}

	init ()
	{
		config = HyritConfig.gi()
		dataM = DataManager.gi()
		camera = Camera.gi()

		this._init()

		if (!dataM.initialized)
		{
			throw new Error('DataManager should be initialized before ' + this.constructor.name)
		}

		for (let i = 0; i < config.count; i++)
		{
			const radii = Math.random() * Math.PI * 2
			const x = Math.cos(radii) * Math.random() * dataM.size
			const y = Math.sin(radii) * Math.random() * dataM.size

			this.create(Math.random() > 0 ? TYPE_PROTEIN : TYPE_CELL, {
				pos: Vector.new(x, y)
			})
		}
	}

	create (type, options = {})
	{
		if (!dataM.entityTypes.includes(type)) throw new Error(`No such entity type '${ type }'`)

		const entity = {}

		entity.type = type
		entity.id = ++entityCount
		entity.pos = options.pos || Vector.random(config.size * Math.random())
		entity.dir = options.dir || Vector.random()
		entity.alive = true

		if (type === TYPE_CELL)
		{
			entity.mass = options.mass || config.mass * 0.75 + config.mass * 0.5 * Math.random()
			entity.color = randomHSL()
			entity.target = null
		}
		if (type === TYPE_PROTEIN)
		{
			entity.mass = 0.1
			entity.rotationDir = Math.random() > 0.5 ? -1 : 1
		}

		Object.defineProperty(entity, 'radius', {
			get () { return (Math.sqrt(this.mass) + Math.cbrt(this.mass)) * 1.5 }
		})
		Object.defineProperty(entity, 'scope', {
			get () { return this.radius * 5 }
		})
		Object.defineProperty(entity, 'speed', {
			get ()
			{
				let speed = Math.log(this.mass) / Math.sqrt(this.mass) * 1.5
				if (this.state === 'chasing') speed *= 1.2
				return speed
			}
		})
		Object.defineProperty(entity, 'state', {
			get ()
			{
				if (this.target)
				{
					if (this.target.type === TYPE_PROTEIN) return 'feeding'
					if (this.target.type === TYPE_CELL) return 'chasing'
				}
				return 'wandering'
			}
		})

		dataM.addEntity(entity)

		return entity
	}

	kill (entity)
	{
		if (entity === camera.target)
		{
			camera.pos = Vector.from(entity.pos)
			camera.focus()
		}

		entity.alive = false
		dataM.delEntity(entity)
	}
}
