// The patient's profile. This whole object is encrypted before it is saved.
// Medical sections (basics, medicines, allergies, ...) are added in Step 2.

export type Profile = {
  preferredName: string;
  createdAt: string;
  updatedAt: string;
};

export function newProfile(preferredName: string): Profile {
  const now = new Date().toISOString();
  return { preferredName, createdAt: now, updatedAt: now };
}
