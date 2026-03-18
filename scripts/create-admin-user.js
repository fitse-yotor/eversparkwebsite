/**
 * One-time script to create the admin user
 * Run this with: node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  const email = 'abdisa@eversparktech.com'
  const password = '@Eversparktestdb123456'
  const fullName = 'Abdisa Admin'

  console.log('🚀 Creating admin user...')
  console.log(`📧 Email: ${email}`)

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    })

    if (authError) {
      console.error('❌ Error creating user:', authError.message)
      process.exit(1)
    }

    if (!authData.user) {
      console.error('❌ No user data returned')
      process.exit(1)
    }

    console.log('✅ User created in auth.users')
    console.log(`👤 User ID: ${authData.user.id}`)

    // Update profile to super_admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'super_admin',
        full_name: fullName
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message)
      process.exit(1)
    }

    console.log('✅ Profile updated to super_admin role')

    // Create admin_users entry
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: authData.user.id,
        permissions: {
          can_manage_content: true,
          can_manage_users: true,
          can_manage_settings: true
        },
        is_active: true
      })

    if (adminError) {
      console.error('❌ Error creating admin entry:', adminError.message)
      process.exit(1)
    }

    console.log('✅ Admin entry created')
    console.log('\n🎉 SUCCESS! Admin user created successfully!')
    console.log('\n📝 Login credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n🌐 You can now log in at: http://localhost:3000/admin')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

createAdminUser()
