#!/usr/bin/env node

import { _dirname, join } from '@hbauer/convenience-functions'
import { createAddressRecord, getSubdomain } from './src/index.js'

const stdout = console.log
const dirname = _dirname(import.meta.url)

// Wrapped because CJS build complains otherwise
async function run() {
  const targetDomain = process.env.TARGET_DOMAIN

  const pathToFiveLetterWords = join(dirname, 'src/five-letter-words')
  const subdomain = await getSubdomain(targetDomain, pathToFiveLetterWords)
  const { status, message } = await createAddressRecord(targetDomain, subdomain)

  const info = {
    success: status === 'SUCCESS' && true,
    message,
    subdomain,
    domain: subdomain + '.' + targetDomain,
  }
  stdout(JSON.stringify(info))
}

run()
