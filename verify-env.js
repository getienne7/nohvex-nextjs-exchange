#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Run this to verify all required environment variables are set correctly
 */

const requiredEnvVars = {
  // Public variables (available in browser)
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID': 'WalletConnect Project ID',
  'NEXT_PUBLIC_CHANGENOW_API_KEY': 'ChangeNOW API Key',
  'NEXT_PUBLIC_CHANGENOW_REFERRAL': 'ChangeNOW Referral Code',
  
  // Server-side variables
  'NOWNODES_API_KEY': 'NOWNodes API Key',
  'NEXTAUTH_SECRET': 'NextAuth Secret',
  'NODE_ENV': 'Node Environment',
  'DATABASE_URL': 'Database URL',
  'NEXTAUTH_URL': 'NextAuth URL'
}

console.log('🔍 Environment Variables Verification\n')
console.log('=' .repeat(50))

let allSet = true
let publicVarsCount = 0
let serverVarsCount = 0

for (const [envVar, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[envVar]
  const isPublic = envVar.startsWith('NEXT_PUBLIC_')
  
  if (isPublic) publicVarsCount++
  else serverVarsCount++
  
  if (value) {
    const displayValue = envVar.includes('SECRET') || envVar.includes('KEY') 
      ? `${value.substring(0, 8)}...` 
      : value.length > 50 
        ? `${value.substring(0, 47)}...`
        : value
    
    console.log(`✅ ${envVar}`)
    console.log(`   ${description}: ${displayValue}`)
  } else {
    console.log(`❌ ${envVar}`)
    console.log(`   ${description}: NOT SET`)
    allSet = false
  }
  console.log('')
}

console.log('=' .repeat(50))
console.log(`📊 Summary:`)
console.log(`   Public variables: ${publicVarsCount}`)
console.log(`   Server variables: ${serverVarsCount}`)
console.log(`   Total variables: ${Object.keys(requiredEnvVars).length}`)

if (allSet) {
  console.log('\n🎉 All environment variables are set!')
  console.log('✅ Your application should work correctly in production.')
} else {
  console.log('\n⚠️  Some environment variables are missing!')
  console.log('❌ Please set the missing variables in your deployment platform.')
}

console.log('\n🔗 Useful links:')
console.log('   • Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables')
console.log('   • WalletConnect Cloud: https://cloud.walletconnect.com/')
console.log('   • ChangeNOW API: https://changenow.io/api/docs')
console.log('   • NOWNodes API: https://nownodes.io/')