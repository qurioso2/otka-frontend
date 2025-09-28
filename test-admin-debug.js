// Debug admin dashboard issue step by step
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminFlow() {
  console.log('=== Testing Admin Dashboard Flow ===\n');

  try {
    // Step 1: Test login
    console.log('1. Testing Login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@otka.ro',
      password: 'Parola!3'
    });

    if (loginError) {
      console.log('❌ Login Failed:', loginError.message);
      return;
    }

    console.log('✅ Login Successful');
    console.log('   User ID:', loginData.user.id);
    console.log('   Email:', loginData.user.email);
    console.log('   Email Confirmed:', loginData.user.email_confirmed_at ? 'Yes' : 'No');

    // Step 2: Test auth.getUser()
    console.log('\n2. Testing auth.getUser()...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ getUser Failed:', userError.message);
      return;
    }
    
    if (!user) {
      console.log('❌ No user found');
      return;
    }

    console.log('✅ getUser Successful');
    console.log('   User:', user.email);

    // Step 3: Test profile query (EXACT same as admin page)
    console.log('\n3. Testing Profile Query (admin page logic)...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .maybeSingle();

    if (profileError) {
      console.log('❌ Profile Query Failed:', profileError.message);
      console.log('   Error Code:', profileError.code);
      console.log('   Error Details:', profileError.details);
      return;
    }

    console.log('✅ Profile Query Successful');
    console.log('   Profile:', profile);
    console.log('   Role:', profile?.role);
    console.log('   isAdmin:', profile?.role === 'admin');

    // Step 4: Test admin logic result
    console.log('\n4. Admin Dashboard Logic Result...');
    const adminPageWouldPass = !!user && profile?.role === 'admin';
    console.log('   User exists:', !!user);
    console.log('   Role is admin:', profile?.role === 'admin');
    console.log('   Admin Dashboard Access:', adminPageWouldPass ? '✅ ALLOWED' : '❌ DENIED');

    if (adminPageWouldPass) {
      console.log('\n🎉 Admin dashboard should work! The issue might be elsewhere.');
    } else {
      console.log('\n⚠️ Admin dashboard would be denied. Check the role in database.');
    }

    // Step 5: Additional debugging - check RLS policies
    console.log('\n5. Testing Users Table Access...');
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('email, role, partner_status');

    if (usersError) {
      console.log('❌ Users Table Access Failed:', usersError.message);
      console.log('   This might indicate RLS policy issues');
    } else {
      console.log('✅ Users Table Accessible');
      console.log('   Total users:', allUsers?.length || 0);
      const admins = allUsers?.filter(u => u.role === 'admin') || [];
      console.log('   Admin users:', admins.length);
      admins.forEach(admin => {
        console.log(`     - ${admin.email} (${admin.partner_status})`);
      });
    }

  } catch (error) {
    console.log('❌ Test Failed:', error.message);
  } finally {
    // Logout
    await supabase.auth.signOut();
    console.log('\n🔐 Logged out');
  }
}

testAdminFlow();