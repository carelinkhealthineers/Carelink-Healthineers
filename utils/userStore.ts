export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatarColor: string;
  role: 'admin' | 'clinician' | 'engineer' | 'guest';
  status: 'active' | 'banned';
  createdAt: string;
  lastLoginAt: string;
  meetingsJoinedCount: number;
}

const STORAGE_KEY_CURRENT_USER = 'carelink_current_user_v2';
const STORAGE_KEY_ALL_USERS = 'carelink_all_users_v2';

const AVATAR_COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', 
  '#10b981', '#f59e0b', '#06b6d4', '#14b8a6'
];

export const getRandomAvatarColor = (): string => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

export const generateRandomUsername = (): string => {
  const prefixes = ['Clinician', 'Doctor', 'Engineer', 'Specialist', 'Director', 'User', 'Guest'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(Math.random() * 8999 + 1000);
  return `${prefix}_${num}`;
};

export const getStoredUsers = (): UserProfile[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ALL_USERS);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.warn('Failed to parse stored users:', err);
  }
  return [];
};

export const saveUsers = (users: UserProfile[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
};

export const getOrCreateCurrentUser = (): UserProfile => {
  try {
    const existingCurrent = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (existingCurrent) {
      const parsed: UserProfile = JSON.parse(existingCurrent);
      // Ensure user exists in all users list
      const allUsers = getStoredUsers();
      const idx = allUsers.findIndex(u => u.id === parsed.id);
      if (idx >= 0) {
        allUsers[idx].lastLoginAt = new Date().toISOString();
        saveUsers(allUsers);
        return allUsers[idx];
      } else {
        allUsers.push(parsed);
        saveUsers(allUsers);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading current user session:', err);
  }

  // Auto-generate new account
  const newUserId = `usr_${Date.now()}_${Math.floor(Math.random() * 899 + 100)}`;
  const randomUsername = generateRandomUsername();
  
  const newUser: UserProfile = {
    id: newUserId,
    username: randomUsername,
    displayName: randomUsername.replace('_', ' '),
    avatarColor: getRandomAvatarColor(),
    role: 'guest',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    meetingsJoinedCount: 0
  };

  const allUsers = getStoredUsers();
  allUsers.push(newUser);
  saveUsers(allUsers);

  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
  } catch (e) {
    console.error('Failed to set current user:', e);
  }

  return newUser;
};

export const updateCurrentUserProfile = (updates: Partial<UserProfile>): UserProfile => {
  const currentUser = getOrCreateCurrentUser();
  const updated = { ...currentUser, ...updates };
  
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(updated));
  
  const allUsers = getStoredUsers();
  const idx = allUsers.findIndex(u => u.id === updated.id);
  if (idx >= 0) {
    allUsers[idx] = updated;
  } else {
    allUsers.push(updated);
  }
  saveUsers(allUsers);

  return updated;
};

export const banOrUnbanUser = (userId: string, banStatus: 'active' | 'banned'): UserProfile[] => {
  const allUsers = getStoredUsers();
  const updated = allUsers.map(u => u.id === userId ? { ...u, status: banStatus } : u);
  saveUsers(updated);
  return updated;
};

export const deleteUserAccount = (userId: string): UserProfile[] => {
  const allUsers = getStoredUsers().filter(u => u.id !== userId);
  saveUsers(allUsers);
  return allUsers;
};
