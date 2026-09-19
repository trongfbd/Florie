// Centralized shop contact info — the floating contact widget, the
// homepage contact section, and the footer all read from here. Update the
// values below (and nothing else) to change a phone number, social link,
// or address everywhere it appears.

// Real coordinates + canonical Google Maps listing for the shop's actual
// address below — taken from the shop's own Google Maps share link, so the
// embed/directions pins land exactly right and the review link goes
// straight to this listing (not a fuzzy address-text search match).
const GOOGLE_MAPS_LAT = 10.7963821;
const GOOGLE_MAPS_LNG = 106.6902335;
const GOOGLE_MAPS_PLACE_URL =
  "https://www.google.com/maps/place/45+Hoa+H%E1%BB%93ng,+C%E1%BA%A7u+Ki%E1%BB%87u,+H%E1%BB%93+Ch%C3%AD+Minh,+Vi%E1%BB%87t+Nam/@10.7963874,106.6876586,17z/data=!3m1!4b1!4m6!3m5!1s0x317528ce686c6855:0xfb9b429db4106d3d!8m2!3d10.7963821!4d106.6902335!16s%2Fg%2F11f3m8p3s2";

export const contactConfig = {
  phone: "0398263715",
  phoneDisplay: "0398263715",
  zaloUrl: "https://zalo.me/0398263715",
  messengerUrl: "https://m.me/61594638954256",
  facebookUrl: "https://www.facebook.com/profile.php?id=61594638954256",
  address: "45 Hoa Hồng, Cầu Kiệu, Hồ Chí Minh, Việt Nam",
  openingHours: "8:00 - 21:00, tất cả các ngày trong tuần",

  // No Google API key needed — embed/directions are plain query-string
  // URLs built from the real coordinates above; the review link is the
  // shop's actual Google Maps listing URL, verbatim.
  googleMapsEmbedUrl: `https://www.google.com/maps?q=${GOOGLE_MAPS_LAT},${GOOGLE_MAPS_LNG}&output=embed`,
  googleMapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${GOOGLE_MAPS_LAT},${GOOGLE_MAPS_LNG}`,
  googleReviewUrl: GOOGLE_MAPS_PLACE_URL,

  // Fill these in from the shop's real Google Business Profile once
  // available. Left as null, the rating block simply doesn't render —
  // never fall back to a made-up number here.
  googleRating: null as number | null,
  googleReviewCount: null as number | null,
};
