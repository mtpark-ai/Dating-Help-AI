# Supabase Authentication Setup

This guide will help you set up Supabase authentication for the Dating Help AI application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:

### Site URL
Add your development URL:
- `http://localhost:3000` (for development)
- `https://yourdomain.com` (for production)

### Redirect URLs
Add these redirect URLs:
- `http://localhost:3000/login`
- `http://localhost:3000/reset-password`
- `https://yourdomain.com/login` (for production)
- `https://yourdomain.com/reset-password` (for production)

### Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link

## 5. Enable Email Confirmation (Optional)

1. Go to **Authentication** → **Settings**
2. Under "User Registration", you can:
   - Enable/disable email confirmation
   - Set minimum password length
   - Configure password strength requirements

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Try creating a new account
4. Check your email for confirmation (if enabled)
5. Test signing in and out

## 7. Database Schema (Optional)

If you want to store additional user data, you can create custom tables:

```sql
-- Example: Create a profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## 8. Production Deployment

When deploying to production:

1. Update your environment variables with production Supabase credentials
2. Update Site URL and Redirect URLs in Supabase dashboard
3. Configure your domain in Supabase
4. Test authentication flow in production

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check that your environment variables are correctly set
   - Restart your development server after changing env vars

2. **Redirect errors**
   - Ensure your redirect URLs are correctly configured in Supabase
   - Check that your site URL matches your actual domain

3. **Email not sending**
   - Check Supabase logs in the dashboard
   - Verify email templates are configured
   - Check spam folder

### Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues) 