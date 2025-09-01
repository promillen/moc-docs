// Serverless function to check authentication
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        authenticated: false, 
        isDeveloper: false,
        error: 'No authorization token provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ 
        authenticated: false, 
        isDeveloper: false,
        error: 'Invalid token' 
      });
    }

    // Check user role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      console.error('Error checking user role:', roleError);
      return res.status(200).json({
        authenticated: true,
        isDeveloper: false,
        user: {
          id: user.id,
          email: user.email
        }
      });
    }

    const isDeveloper = roleData.role === 'developer' || roleData.role === 'admin';

    return res.status(200).json({
      authenticated: true,
      isDeveloper,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ 
      authenticated: false, 
      isDeveloper: false,
      error: 'Internal server error' 
    });
  }
}