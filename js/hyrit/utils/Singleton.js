'use strict'


// Class

export const Singleton = class
{
	constructor ()
	{
		this.initialized = false
	}

	_init ()
	{
		this.initialized = true
		console.log('initialized ::', this.constructor.name)
	}

	static gi ()
	{
		if (!this.instance) this.instance = new this()
		return this.instance
	}
}
