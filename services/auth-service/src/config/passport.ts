import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from '../config';
import { findOrCreateGoogleUser } from '../services/auth.service';

export function setupPassport(): void {
  if (!config.google.clientId || !config.google.clientSecret) {
    console.warn('[Auth] Google OAuth not configured – skipping passport setup.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const avatar = profile.photos?.[0]?.value;
          if (!email) return done(new Error('No email from Google profile'));

          const { user, tokens } = await findOrCreateGoogleUser({
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar,
          });
          return done(null, { user, tokens });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}
