import fetch from 'node-fetch'
import { buildURL } from '@hbauer/convenience-functions'
import { splitLines, loadWords, selectWord } from './helpers.js'

const stdout = console.log

/**
 * @param {string} domain
 * @returns {Promise<string[]>}
 */
function getInstanceNames(domain) {
  const url = buildURL({
    host: 'https://porkbun.com',
    path: `api/json/v3/dns/retrieve/${domain}`,
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
  const names = await getInstanceNames(domain)
  return names.includes(name) ? getSubdomain(path) : name
}

/**
 *
 * @param {string} domain
 * @param {string} subdomain
 * @returns {Promise<{ status: string, message: string }>}
 */
function createAddressRecord(domain, subdomain) {
  const url = buildURL({
    host: 'https://porkbun.com',
    path: `api/json/v3/dns/create/${domain}`,
  })

  const body = {
    secretapikey: process.env.API_SECRET,
    apikey: process.env.API_KEY,
    name: subdomain,
    type: 'asdadsf',
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

const domain = process.env.TARGET_DOMAIN
const subdomain = await getSubdomain('./src/five-letter-words')
const { status, message } = await createAddressRecord(domain, subdomain)

stdout(status === 'SUCCESS' ? true : message)
