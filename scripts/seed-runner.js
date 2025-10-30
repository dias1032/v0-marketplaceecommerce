/*
  Simple node script to run seed inserts using environment SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.
  Meant for local demo use only.
*/
const { createClient } = require('@supabase/supabase-js')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}
const supabase = createClient(url, key)

async function run() {
    console.log('Seed runner starting (demo)')
        // Create 10 demo vendors and some products
    for (let i = 1; i <= 10; i++) {
        const email = `vendor${i}@demo.com`
        const { data: user } = await supabase.from('users').insert({ email, name: `Vendor ${i}`, role: 'vendor' }).select().single()
        await supabase.from('vendors').insert({ user_id: user.id, store_name: `Loja ${i}`, slug: `loja-${i}`, status: i % 3 === 0 ? 'pending' : 'approved' })
    }
    console.log('Seed runner finished — check your DB')
}
run().catch(console.error)