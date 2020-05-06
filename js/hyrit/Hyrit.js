'use strict'


// Packages

import { HyritConfig } from './HyritConfig.js'
import { DataManager } from './managers/DataManager.js'
import { EntitiesManager } from './managers/EntitiesManager.js'
import { CanvasRenderer } from './render/CanvasRenderer.js'
import { Singleton } from './utils/Singleton.js'
import { EntityUpdatesResolver } from './engine/EntityUpdatesResolver.js'
import { circleCollision } from './utils/Utils.js'
import { Camera } from './render/Camera.js'
import { Vector } from './utils/Vector.js'


// General

let config, dataM, entitiesM, renderer, camera, euResolver


// Class

export const Hyrit = class extends Singleton
{
	constructor ()
	{
		super()
	}

	init (conf = {})
	{
		config = HyritConfig.gi()
		dataM = DataManager.gi()
		entitiesM = EntitiesManager.gi()
		renderer = CanvasRenderer.gi()
		camera = Camera.gi()
		euResolver = EntityUpdatesResolver.gi()

		config.init(conf)
		dataM.init()
		renderer.init()
		entitiesM.init()
		camera.init()
		euResolver.init()

		window.addEventListener('click', e =>
		{
			const entities = dataM.entityList()

			const x = e.clientX - (renderer.canvas.width)  / 2 + camera.x
			const y = e.clientY - (renderer.canvas.height) / 2 + camera.y
			
			for (const entity of entities)
			{
				const collision = circleCollision(entity.pos.x, x, entity.pos.y, y, entity.radius)
				
				if (collision.collides)
				{
					camera.focus(entity)
					console.log('focus:', entity)
					return
				}
			}

			entitiesM.create('cell', {
				pos: Vector.new(x, y)
			})
		})

		this._init()

		if (config.autorun) this.run()
	}

	run ()
	{
		this.update()
	}

	update ()
	{
		const entities = Object.keys(dataM.entities).map(id => dataM.entities[id])

		for (const entity of entities) euResolver.updatePosition(entity)
		for (const entity of entities) euResolver.updateCollisions(entity)

		renderer.draw()

		requestAnimationFrame(() => this.update())
	}
}
