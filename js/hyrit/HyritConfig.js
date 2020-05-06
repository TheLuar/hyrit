'use strict'


// Dependences

import { Singleton } from './utils/Singleton.js'


// Class

export const HyritConfig = class extends Singleton
{
	constructor ()
	{
		super()

		this.container = null
		this.size = null
		this.count = null
		this.mass = null
		this.autorun = null
	}

	init (conf = {})
	{
		const magicNumberOfEverything = 800

		const {
			container = document.body,
			size = magicNumberOfEverything,
			count = magicNumberOfEverything * 0.1,
			mass = magicNumberOfEverything * 0.01,
			autorun = true,
		} = conf

		this.container = container
		this.size = size
		this.count = count
		this.mass = mass
		this.autorun = autorun

		this._init()
	}
}
