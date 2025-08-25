# Authentication Setup Guide

This project uses Supabase for authentication. Follow these steps to set up authentication for your application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create an account
2. Click "New Project" and fill in the details:
   - Name: CoWork (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the closest region to your users

## 2. Get Your Supabase Keys

1. Once your project is created, go to `Settings` > `API`
2. Copy the following values:
   - **Project URL** (anon/public)
   - **API Key** (anon/public)

## 3. Configure Environment Variables

Update your `.env` file with the Supabase credentials:

```env
VITE_SERVER_URI=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace:
- `your_supabase_project_url_here` with your Project URL
- `your_supabase_anon_key_here` with your API Key

## 4. Configure Authentication Providers (Optional)

If you want to enable Google and GitHub sign-in:

### Google OAuth Setup:
1. In Supabase Dashboard, go to `Authentication` > `Providers`
2. Find Google and toggle it on
3. Get your Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
4. Enter your Client ID and Client Secret

### GitHub OAuth Setup:
1. In Supabase Dashboard, go to `Authentication` > `Providers`
2. Find GitHub and toggle it on
3. Create a GitHub OAuth App in your [GitHub Developer Settings](https://github.com/settings/developers)
4. Enter your Client ID and Client Secret

## 5. Configure Email Settings

1. Go to `Authentication` > `Settings`
2. Configure your SMTP settings or use Supabase's built-in email service
3. Customize email templates as needed

## 6. Set up URL Configuration

1. Go to `Authentication` > `Settings`
2. Add your site URL: `http://localhost:5173` (for development)
3. For production, add your production URL
4. Add redirect URLs for OAuth providers if using them

## 7. Spring Boot Backend Integration

Your Spring Boot backend can validate Supabase JWT tokens. Here's a basic example:

### Add JWT dependency to `pom.xml`:
```xml
<dependency>
    <groupId>com.auth0</groupId>
    <artifactId>java-jwt</artifactId>
    <version>4.4.0</version>
</dependency>
```

### Create a JWT validation filter:
```java
@Component
public class JwtAuthenticationFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String authHeader = httpRequest.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // Validate the JWT token here
            // You can use the Supabase JWT secret to verify the token
        }
        
        chain.doFilter(request, response);
    }
}
```

## 8. Testing the Authentication

1. Start your React development server: `npm run dev`
2. Start your Spring Boot server: `./mvnw spring-boot:run`
3. Navigate to `http://localhost:5173`
4. Try signing up with email/password
5. Check your email for confirmation (if email confirmation is enabled)
6. Try logging in and accessing protected routes

## Features Included

✅ **Email/Password Authentication**
- Sign up with email and password
- Email confirmation (configurable)
- Login/logout functionality
- Password reset via email

✅ **OAuth Authentication**
- Google Sign-In
- GitHub Sign-In
- Automatic account linking

✅ **Protected Routes**
- Routes are protected and redirect to login if not authenticated
- Automatic redirection back to intended page after login

✅ **User Management**
- User profile information
- Display user name and avatar
- User metadata storage

✅ **API Integration**
- Automatic JWT token inclusion in API calls
- Ready for Spring Boot backend integration
- Error handling and token refresh

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**
   - Make sure your `.env` file is in the root directory
   - Restart your development server after changing environment variables

2. **OAuth Providers Not Working**
   - Check that redirect URLs are correctly configured
   - Ensure OAuth apps are properly set up in Google/GitHub

3. **Email Confirmation Issues**
   - Check your SMTP settings in Supabase
   - Look in spam folder for confirmation emails
   - You can disable email confirmation in Supabase settings for testing

4. **CORS Issues with Backend**
   - Make sure your Spring Boot app allows CORS from your frontend URL
   - Add proper CORS configuration in your Spring Boot application

For more detailed Supabase documentation, visit: https://supabase.com/docs
