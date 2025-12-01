type User = {
  username: string;
  password: string; // Not safe to store passwords in plain text, but this is a demo
  profilePicture?: string;
};

const users: User[] = [];

const cookies: Record<string, string> = {};

export function registerUser(username: string, password: string): boolean {
  if (users.find((user) => user.username === username)) {
    return false; // User already exists
  }
  users.push({ username, password });
  return true;
}

export function authenticateUser(
  username: string,
  password: string
): string | undefined {
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    // Generate a simple session ID (not secure, for demo purposes only)
    const sessionId = Math.random().toString(36).substring(2);
    cookies[sessionId] = username;
    return sessionId;
  }

  return undefined;
}

export function getUsernameFromSession(sessionId: string): string | undefined {
  return cookies[sessionId];
}

export function getUserByUsername(username: string): User | undefined {
  return users.find((user) => user.username === username);
}

export function setProfilePicture(username: string, profilePicture: string): boolean {
  const user = users.find((user) => user.username === username);
  if (user) {
    user.profilePicture = profilePicture;
    return true;
  }
  return false;
}
