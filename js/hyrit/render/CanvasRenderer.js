'use strict'


// Packages

import { Singleton } from '../utils/Singleton.js'

import { HyritConfig } from '../HyritConfig.js'

import { DataManager } from '../managers/DataManager.js'

import { Camera } from './Camera.js'


// General

let config, dataM, camera


// Class

export const CanvasRenderer = class extends Singleton
{
	constructor ()
	{
		super()

		this.lastDrawTime = new Date()
		this.canvas = null
		this.ctx = null
	}

	init ()
	{
		config = HyritConfig.gi()
		dataM = DataManager.gi()
		camera = Camera.gi()

		this.canvas = document.createElement('canvas')
		this.ctx = this.canvas.getContext('2d')
		
		window.addEventListener('resize', () => this.resize())
		config.container.appendChild(this.canvas)

		this.resize()
		this._init()
	}

	resize ()
	{
		if (!dataM.initialized) return
		this.canvas.width  = config.container.offsetWidth
		this.canvas.height = config.container.offsetHeight
	}

	draw ()
	{
		const drawingStartTime = new Date()

		this.clear()
		this.translate()
		this.borders()
		this.cells()
		this.restore()
		
		this.ctx.fillStyle = '#DDDDDD'
		this.ctx.fillText('entities: ' + dataM.entityList().length, 30, 40)
		this.ctx.fillText(`drawing delay: ${ new Date() - drawingStartTime }ms`, 30, 70)
		this.ctx.fillText('fps: ' + (new Date() - this.lastDrawTime), 30, 55)

		this.lastDrawTime = new Date()
	}

	clear ()
	{
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.lastClearTime = new Date()
	}

	translate ()
	{
		this.ctx.save()

		let x = this.canvas.width  / 2 - camera.x
		let y = this.canvas.height / 2 - camera.y

		this.ctx.translate(x, y)
	}

	restore ()
	{
		this.ctx.restore()
	}

	borders ()
	{
		this.ctx.beginPath()
		this.ctx.arc(0, 0, dataM.size, 0, Math.PI * 2)
		this.ctx.strokeStyle = '#FFFFFF88'
		this.ctx.lineWidth = 2
		this.ctx.stroke()
		this.ctx.closePath()
	}

	cells ()
	{
		const entities = dataM.entityList().sort((a, b) => a.mass - b.mass)

		for (const entity of entities)
		{
			// Prevent from rendering entities out of screen
			if (entity.pos.x + entity.radius < camera.x - this.canvas.width  / 2 ||
			    entity.pos.y + entity.radius < camera.y - this.canvas.height / 2 ||
			    entity.pos.x - entity.radius > camera.x + this.canvas.width  / 2 ||
			    entity.pos.y - entity.radius > camera.y + this.canvas.height / 2) continue

			const { pos, dir, radius, color, target } = entity

			this.ctx.beginPath()
			this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
			this.ctx.fillStyle = color
			this.ctx.fill()
			this.ctx.beginPath()
			this.ctx.arc(pos.x + dir.x * (radius / 2), pos.y + dir.y * (radius / 2), Math.sqrt(radius), 0, Math.PI * 2)
			this.ctx.fillStyle = '#000000'
			this.ctx.fill()
			this.ctx.closePath()

			// if (target)
			// {
			// 	this.ctx.beginPath()
			// 	this.ctx.moveTo(pos.x, pos.y)
			// 	this.ctx.lineTo(target.pos.x, target.pos.y)
			// 	this.ctx.strokeStyle = color
			// 	this.ctx.stroke()
			// 	this.ctx.closePath()
			// }
		}
	}
}
