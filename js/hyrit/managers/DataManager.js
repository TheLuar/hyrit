'use strict'


// Packages

import { TYPE_CELL, TYPE_PROTEIN } from '../consts.js'
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

		this.entities = null
		this.entMap = null
		this.entityTypes = null
	}

	init ()
	{
		config = HyritConfig.gi()

		this.size = config.size
		this.entities = {}
		this.entMap = {}
		this.entityTypes = [TYPE_PROTEIN, TYPE_CELL]

		for (const type of this.entityTypes) this.entMap[type] = {}

		this._init()
	}

	entityList ()
	{
		return Object.keys(this.entities).map(id => this.entities[id])
	}

	addEntity (entity)
	{
		this.entities[entity.id] = entity
		this.entMap[entity.type][entity.id] = entity
	}

	delEntity (entity)
	{
		delete this.entities[entity.id]
		delete this.entMap[entity.type][entity.id]
	}

	getEntity (id)
	{
		return this.entities[id] || null
	}

	getEntities (type)
	{
		return this.entMap[type] || null
	}

	getEntitiesList (type)
	{
		const map = this.getEntities(type)
		return map ? Object.keys(map).map(id => this.getEntity(id)) : null
	}
}
