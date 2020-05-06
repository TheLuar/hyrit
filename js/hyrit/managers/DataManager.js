'use strict'


// Packages

import { Singleton } from '../utils/Singleton.js'
import { HyritConfig } from '../HyritConfig.js'


// General

let config


// Class

export const DataManager = class extends Singleton
{
	constructor ()
	{
		super()

		this.stage = null
		this.entities = null
	}

	init ()
	{
		config = HyritConfig.gi()

		this.size = config.size
		this.entities = {}

		this._init()
	}

	entityList ()
	{
		return Object.keys(this.entities).map(id => this.entities[id])
	}
}
