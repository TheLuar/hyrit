'use strict'


// Dependences

import { Singleton } from '../utils/Singleton.js'

import { Vector } from '../utils/Vector.js'


// Class

export const Camera = class extends Singleton
{
	constructor ()
	{
		super()

		this.target = null
		this.pos = null
	}

	init ()
	{
		this.pos = Vector.new()

		this._init()
	}

	focus (entity = null)
	{
		this.target = entity
	}

	get x () { return this.target ? this.target.pos.x : this.pos.x }
	get y () { return this.target ? this.target.pos.y : this.pos.y }
}