import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  authenticateUser,
  getUsernameFromSession,
  registerUser,
  getUserByUsername,
  setProfilePicture,
} from './user.js';

const app = express();
const port = 8080;

// Helper function to parse cookies manually
function getCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  return cookie ? cookie.substring(name.length + 1) : undefined;
}

// User API
app.get('/api/user/login', (req, res) => {
  const { username, password } = req.query;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  // Simple authentication logic (for demo purposes only)
  const sessionCookie = authenticateUser(
    username as string,
    password as string
  );
  if (sessionCookie) {
    // Set a cookie in the response
    res.cookie('session', sessionCookie);
    return res.json({ message: 'Login successful' });
  } else {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
});

app.get('/api/user/signup', (req, res) => {
  const { username, password } = req.query;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  if (registerUser(username as string, password as string)) {
    const sessionCookie = authenticateUser(
      username as string,
      password as string
    );
    res.cookie('session', sessionCookie!);
    return res.json({ message: 'signup successful' });
  } else {
    return res.status(409).json({ error: 'Username already taken' });
  }
});

app.get('/api/user', (req, res) => {
  // Retrieve cookie
  const sessionCookie = getCookie(req.headers.cookie, 'session');
  if (!sessionCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Simple session validation (for demo purposes only)
  const username = getUsernameFromSession(sessionCookie);
  if (username) {
    const user = getUserByUsername(username);
    return res.json({ username, profilePicture: user?.profilePicture });
  } else {
    return res.status(401).json({ error: 'Invalid session' });
  }
});

app.get('/api/user/profile-picture', (req, res) => {
  const sessionCookie = getCookie(req.headers.cookie, 'session');
  if (!sessionCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const username = getUsernameFromSession(sessionCookie);
  if (!username) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Profile picture URL is required' });
  }

  if (setProfilePicture(username, url as string)) {
    return res.json({ message: 'Profile picture updated' });
  } else {
    return res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// Chat API
const messages: Array<{ username: string; message: string; timestamp: number }> = [];

app.get('/api/messages/send', (req, res) => {
  const sessionCookie = getCookie(req.headers.cookie, 'session');
  if (!sessionCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const username = getUsernameFromSession(sessionCookie);
  if (!username) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const { message } = req.query;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  messages.push({ username, message: message as string, timestamp: Date.now() });
  return res.json({ message: 'Message sent' });
});

app.get('/api/messages', (req, res) => {
  const sessionCookie = getCookie(req.headers.cookie, 'session');
  if (!sessionCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const username = getUsernameFromSession(sessionCookie);
  if (!username) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  // Add current profile pictures to messages
  const messagesWithProfiles = messages.map(msg => {
    const user = getUserByUsername(msg.username);
    return {
      ...msg,
      profilePicture: user?.profilePicture
    };
  });

  return res.json({ messages: messagesWithProfiles });
});

// Redirect root to /index.html
app.get('/', (_, res) => {
  res.redirect('/index.html');
});

// Handle API not found
app.get(/$\/api\/.*/, (_, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Handle site not found
app.get(/.*/, async (req, res) => {
  // Return a file under /site
  const filePath = path.join(process.cwd(), 'site', req.path);

  console.info('Requested file:', filePath);

  try {
    // Check whether the file exists and is accessible and is a file
    await fs.access(filePath);
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      throw new Error('Not a file');
    }

    res.sendFile(filePath);
  } catch (_) {
    console.error('File not found:', filePath);
    // Serve the 404 page (containing XSS vulnerability)
    res.status(404).sendFile(path.join(process.cwd(), 'site', '404.html'));
  }
});

app.listen(port, () => {
  console.info(`Server is running at http://localhost:${port}`);
});
