// Simple in-memory store; survives client-side route transitions.
let photos: string[] = [];

export function setBoothPhotos(p: string[]) {
  photos = p;
  try {
    sessionStorage.setItem("booth-photos", JSON.stringify(p));
  } catch {}
}

export function getBoothPhotos(): string[] {
  if (photos.length) return photos;
  try {
    const raw = sessionStorage.getItem("booth-photos");
    if (raw) photos = JSON.parse(raw);
  } catch {}
  return photos;
}
