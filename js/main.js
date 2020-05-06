'use strict'


// Packages

import { Hyrit } from './hyrit/Hyrit.js'


// General

const config = {}
const hyrit = Hyrit.gi()

config.container = document.querySelector('#app')
config.size = Math.round(Math.sqrt(innerWidth * innerHeight) * 0.75)
config.count = Math.round(config.size / 10)
config.mass = Math.round(Math.sqrt(config.size))

document.addEventListener('readystatechange', () => (document.readyState === 'complete') && hyrit.init(config))

window.hyrit = hyrit
