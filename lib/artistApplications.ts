// JREAL VISION DESIGN — Curated Artist Applications System
// Manages artist applications, curatorial approval workflows, and portal access verification.

export interface ArtistApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  medium: string;
  bio: string;
  portfolioUrl?: string;
  sampleArtworkUrl?: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export const INITIAL_ARTIST_APPLICATIONS: ArtistApplication[] = [
  {
    id: "app-101",
    name: "Jean Luc Habimana",
    email: "artist.demo@jreal.rw",
    phone: "+250 788 123 456",
    city: "Kigali",
    medium: "Acrylic & Oil on Canvas",
    bio: "Visual artist exploring contemporary Rwandan cultural heritage and urban life through textured acrylic impasto and natural pigments.",
    portfolioUrl: "https://instagram.com/jeanluc_art_rw",
    status: "APPROVED",
    appliedAt: "2026-09-15T10:30:00Z",
    reviewedAt: "2026-09-16T14:20:00Z",
    reviewedBy: "Platform Owner",
  },
  {
    id: "app-102",
    name: "Diane Uwase",
    email: "diane.uwase@studio.rw",
    phone: "+250 785 222 333",
    city: "Musanze",
    medium: "Imigongo Relief & Pigments on Wood",
    bio: "Master artisan creating geometric bas-relief panels honoring traditional Imigongo aesthetics fused with modern minimalist interiors.",
    portfolioUrl: "https://dianeuwase-art.rw",
    status: "PENDING",
    appliedAt: "2026-10-01T09:15:00Z",
  },
  {
    id: "app-103",
    name: "Patrick Mugisha",
    email: "patrick.mugisha@art.rw",
    phone: "+250 782 987 654",
    city: "Huye",
    medium: "Banana Fiber & Sisal Tapestry",
    bio: "Eco-fiber weaver crafting large-scale architectural wall hangings using indigenous Rwandan plant fibers and botanical dyes.",
    portfolioUrl: "https://behance.net/patrickmugisha",
    status: "PENDING",
    appliedAt: "2026-10-02T16:45:00Z",
  },
];

export const STORAGE_KEY_ARTIST_APPS = "jreal_artist_applications_v1";

export function getStoredArtistApplications(): ArtistApplication[] {
  if (typeof window === "undefined") return INITIAL_ARTIST_APPLICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARTIST_APPS);
    if (!raw) return INITIAL_ARTIST_APPLICATIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ARTIST_APPLICATIONS;
  } catch {
    return INITIAL_ARTIST_APPLICATIONS;
  }
}

export function saveStoredArtistApplications(apps: ArtistApplication[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ARTIST_APPS, JSON.stringify(apps));
    window.dispatchEvent(new Event("jreal_artist_applications_updated"));
  } catch (err) {
    console.error("Failed to save artist applications:", err);
  }
}

export function isArtistApprovedByEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  // Default demo artist is approved
  if (cleanEmail === "artist.demo@jreal.rw" || cleanEmail === "owner.director@jreal.rw") return true;
  
  const apps = getStoredArtistApplications();
  const match = apps.find((a) => a.email.trim().toLowerCase() === cleanEmail);
  if (match) return match.status === "APPROVED";

  // Check stored auth role if user has already provisioned an artist account
  if (typeof window !== "undefined") {
    try {
      const storedRole = localStorage.getItem("jreal_auth_role");
      if (storedRole === "ARTIST" || storedRole === "ADMIN") return true;
      const storedUserRaw = localStorage.getItem("jreal_auth_user") || sessionStorage.getItem("jreal_auth_user");
      if (storedUserRaw) {
        const u = JSON.parse(storedUserRaw);
        if (u.email?.trim().toLowerCase() === cleanEmail && (u.role === "ARTIST" || u.role === "ADMIN")) {
          return true;
        }
      }
    } catch {}
  }

  return false;
}

export function getArtistApplicationByEmail(email?: string | null): ArtistApplication | undefined {
  if (!email) return undefined;
  const cleanEmail = email.trim().toLowerCase();
  const apps = getStoredArtistApplications();
  return apps.find((a) => a.email.trim().toLowerCase() === cleanEmail);
}

export function updateArtistApplicationStatus(
  idOrEmail: string,
  newStatus: "APPROVED" | "DECLINED" | "PENDING",
  reviewerName = "Admin Committee"
): ArtistApplication | null {
  const apps = getStoredArtistApplications();
  let updatedApp: ArtistApplication | null = null;
  const target = idOrEmail.trim().toLowerCase();

  const nextList = apps.map((app) => {
    if (app.id.toLowerCase() === target || app.email.toLowerCase() === target) {
      updatedApp = {
        ...app,
        status: newStatus,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewerName,
      };
      return updatedApp;
    }
    return app;
  });

  if (!updatedApp) {
    const fallbackApp: ArtistApplication = {
      id: `app_${Date.now()}`,
      name: idOrEmail.split("@")[0].toUpperCase(),
      email: target,
      phone: "+250 ",
      city: "Kigali",
      medium: "Contemporary Fine Art",
      bio: "JREAL Represented Fine Art Artist",
      status: newStatus,
      appliedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerName,
    };
    saveStoredArtistApplications([fallbackApp, ...apps]);
    return fallbackApp;
  }

  saveStoredArtistApplications(nextList);
  return updatedApp;
}

