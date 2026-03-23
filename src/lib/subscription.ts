export function isPremiumUser(user: { plan?: string | null; planStatus?: string | null }) {
  return user.plan === 'premium' && user.planStatus === 'active';
}
