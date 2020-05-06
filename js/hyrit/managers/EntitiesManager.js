'use strict'


// Packages

import { HyritConfig } from '../HyritConfig.js'
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

			this.create('cell', {
				pos: Vector.new(x, y)
			})
		}
	}

	create (type, options = {})
	{
		const {
			dir = Vector.random(),
			pos = Vector.new(),
			mass = config.mass * 0.75 + config.mass * 0.5 * Math.random(),
			speed = 1,
		} = options

		const id = ++entityCount
		const color = `hsl(${ Math.floor(Math.random() * 360) }, 100%, 50%)`
		const target = null
		const alive = true

		const entity = { type, id, dir, pos, mass, speed, color, target, alive }

		Object.defineProperty(entity, 'radius', {
			get () { return (Math.sqrt(this.mass) + Math.cbrt(this.mass)) * 1.5 }
		})

		dataM.entities[id] = entity

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
		delete dataM.entities[entity.id]
	}
}
