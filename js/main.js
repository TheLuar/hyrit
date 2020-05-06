'use strict'


// Packages

import { Hyrit } from './hyrit/Hyrit.js'


// General

const hyrit = Hyrit.gi()
const container = document.querySelector('#app')
const size = Math.round(Math.sqrt(innerWidth * innerHeight) / 2)
const count = Math.round(size / 10)
const mass = Math.round(Math.sqrt(size))
const config = { container, size, count, mass }

document.addEventListener('readystatechange', () => (document.readyState === 'complete') && hyrit.init(config))

window.hyrit = hyrit
