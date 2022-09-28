import fetch from 'node-fetch'
import { buildURL } from '@hbauer/convenience-functions'
import { splitLines, loadWords, selectWord } from './helpers.js'

const stdout = console.log

const targetDomain = process.env.TARGET_DOMAIN

/**
 * @param {string} targetDomain
 * @returns {Promise<string[]>}
 */
function getInstanceNames(targetDomain) {
  const url = buildURL({
    host: 'https://porkbun.com',
    path: `api/json/v3/dns/retrieve/${targetDomain}`,
  })

  /**
   * @param {{ records: { name: string, type: string }[] }} param0
   * @returns
   */
  const transform = ({ records }) =>
    records
      .filter(record => record.type === 'A')
      .map(record => record.name.split('.')[0])

  const body = {
    secretapikey: process.env.API_SECRET,
    apikey: process.env.API_KEY,
  }

  const init = {
    method: 'post',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }

  // @ts-ignore
  return fetch(url, init)
    .then(response => response.json())
    .then(transform)
}

/**
 * Return a unique subdomain name
 * @param {string} path
 * @returns {Promise<string>}
 */
export const getSubdomain = async path => {
  const name = await loadWords(path).then(splitLines).then(selectWord)
  const names = await getInstanceNames(targetDomain)
  return names.includes(name) ? getSubdomain(path) : name
}

/**
 *
 * @param {string} targetDomain
 * @param {string} subdomain
 * @returns {Promise<{ status: string, message: string }>}
 */
function createAddressRecord(targetDomain, subdomain) {
  const url = buildURL({
    host: 'https://porkbun.com',
    path: `api/json/v3/dns/create/${targetDomain}`,
  })

  const body = {
    secretapikey: process.env.API_SECRET,
    apikey: process.env.API_KEY,
    name: subdomain,
    type: 'A',
    content: process.env.INSTANCE_IP,
  }

  const init = {
    method: 'post',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }

  // @ts-ignore
  return fetch(url, init).then(response => response.json())
}

// Wrapped because CJS build complains otherwise
async function run() {
  const subdomain = await getSubdomain('./src/five-letter-words')
  const { status, message } = await createAddressRecord(targetDomain, subdomain)
  stdout(status === 'SUCCESS' ? true : message)
}

run()
