/**
 * Generates a consistent placeholder avatar URL based on the user's name and ID
 * Uses DiceBear API to create consistent avatar images
 */
export function generatePlaceholderAvatar(name: string, userId: string): string {
  // Create a consistent seed from name and userId
  const seed = `${name}-${userId}`.toLowerCase().replace(/\s+/g, '');
  
  // Use DiceBear's "initials" style for clean, consistent avatars
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=3b82f6,8b5cf6,ef4444,f59e0b,10b981&fontFamily=Arial&fontSize=40&fontWeight=600`;
}

/**
 * Gets the appropriate avatar URL - either the user's image or a placeholder
 */
export function getAvatarUrl(userImage: string | null, name: string, userId: string): string {
  return userImage || generatePlaceholderAvatar(name, userId);
}

/**
 * Gets initials from a name for fallback display
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}