import { promises } from 'fs'

/** @param {string} path */
export const loadWords = path => promises.readFile(path, 'utf-8')

/** @param {string} str */
export const splitLines = str => str.split('\n')

/** @param {string[]} words */
export const selectWord = words =>
  words[Math.floor(Math.random() * words.length)]
