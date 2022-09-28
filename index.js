#!/usr/bin/env node

import { createAddressRecord, getSubdomain } from './src/index.js'

const stdout = console.log

// Wrapped because CJS build complains otherwise
async function run() {
  const targetDomain = process.env.TARGET_DOMAIN
  const subdomain = await getSubdomain(targetDomain, './src/five-letter-words')
  const { status, message } = await createAddressRecord(targetDomain, subdomain)
  stdout(status === 'SUCCESS' ? true : message)
}

run()
