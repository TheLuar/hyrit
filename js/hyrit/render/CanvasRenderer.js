'use strict'


// Packages

import { TYPE_CELL, PI2 } from '../consts.js'
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
		this.entities()
		this.restore()
		

		const entities = dataM.entityList()

		const entityCount = entities.length
		const drawingDelay = new Date() - drawingStartTime + 'ms'
		const framesPerSecond = new Date() - this.lastDrawTime
		const totalMass = [0, ...entities].reduce((a, b) => a + b.mass).toFixed(1)

		const x = 30
		const y = 40
		const rowHeight = 15
		let row = 0

		this.ctx.fillStyle = '#DDDDDD'
		this.ctx.fillText('fps: ' + framesPerSecond, x, y + (row++ * rowHeight))
		this.ctx.fillText('entities: ' + entityCount, x, y + (row++ * rowHeight))
		this.ctx.fillText('total mass: ' + totalMass, x, y + (row++ * rowHeight))
		this.ctx.fillText('drawing delay: ' + drawingDelay, x, y + (row++ * rowHeight))

		if (camera.target && camera.target.type === TYPE_CELL)
		{
			const x = 80
			const y = this.canvas.height - 80
			const r = 30
			const { pos, dir, color, mass, state, speed, radius } = camera.target

			this.ctx.fillStyle = '#00000080'
			this.ctx.fillRect(30, this.canvas.height - 130, 100, 100)

			this.ctx.beginPath()
			this.ctx.arc(x, y, r, 0, PI2)
			this.ctx.fillStyle = color
			this.ctx.fill()
			this.ctx.beginPath()
			this.ctx.arc(x + dir.x * (r / 2), y + dir.y * (r / 2), Math.sqrt(r), 0, PI2)
			this.ctx.fillStyle = '#000000'
			this.ctx.fill()
			this.ctx.closePath()

			const txtX = this.canvas.width  / 2 - radius
			const txtY = this.canvas.height / 2 + radius + 10

			this.ctx.fillStyle = color
			this.ctx.fillText('mass: '     + mass.toFixed(1),  txtX, txtY)
			this.ctx.fillText('behavior: ' + state,            txtX, txtY + 12)
			this.ctx.fillText('speed: '    + speed.toFixed(2), txtX, txtY + 24)
		}
		
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

	entities ()
	{
		for (const type of dataM.entityTypes)
		{
			const entities = dataM.getEntitiesList(type)
				.filter(e => this.visibleOnScreen(e))
				.sort((a, b) => a.mass - b.mass)
			
			this[`draw_${ type }s`](entities)
		}
	}

	visibleOnScreen ({ pos, radius })
	{
		if (pos.x + radius < camera.x - this.canvas.width  / 2 ||
			pos.y + radius < camera.y - this.canvas.height / 2 ||
			pos.x - radius > camera.x + this.canvas.width  / 2 ||
			pos.y - radius > camera.y + this.canvas.height / 2)
			return false
		return true
	}

	draw_cells (cells)
	{
		for (const entity of cells)
		{
			const { pos, dir, radius, color, target } = entity

			// if (target)
			if (target && target.type !== 'place')
			{
				this.ctx.beginPath()
				this.ctx.moveTo(pos.x, pos.y)
				this.ctx.lineTo(target.pos.x , target.pos.y)
				this.ctx.strokeStyle = color
				this.ctx.lineWidth = 1
				this.ctx.stroke()
			}

			this.ctx.beginPath()
			this.ctx.arc(pos.x, pos.y, radius, 0, PI2)
			this.ctx.fillStyle = color
			this.ctx.fill()
			this.ctx.beginPath()
			this.ctx.arc(pos.x + dir.x * (radius / 2), pos.y + dir.y * (radius / 2), Math.sqrt(radius), 0, Math.PI * 2)
			this.ctx.fillStyle = '#000000'
			this.ctx.fill()
			this.ctx.closePath()
		}
	}

	draw_proteins (prots)
	{
		for (const entity of prots)
		{
			const { pos, dir, radius } = entity

			// this.ctx.beginPath()
			// this.ctx.arc(pos.x, pos.y, radius, 0, PI2)
			// this.ctx.fillStyle = '#FF000088'
			// this.ctx.fill()
			this.ctx.beginPath()
			this.ctx.moveTo(pos.x + radius / 2 * dir.x, pos.y + radius / 2 * dir.y)
			this.ctx.lineTo(pos.x - radius / 2 * dir.x, pos.y - radius / 2 * dir.y)
			this.ctx.moveTo(pos.x + radius / 2 * dir.x, pos.y + radius / 2 * dir.y)
			this.ctx.lineTo(pos.x - radius / 2 * dir.x, pos.y - radius / 2 * dir.y)
			this.ctx.lineCap = 'round'
			this.ctx.lineWidth = radius
			this.ctx.strokeStyle = '#FF6699'
			this.ctx.stroke()
			this.ctx.closePath()
		}
	}
}
