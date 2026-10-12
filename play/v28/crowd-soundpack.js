import p0 from "./sfxpart0.js?v=20261013-a";
import p1 from "./sfxpart1.js?v=20261013-a";
import p2 from "./sfxpart2.js?v=20261013-a";
import p3 from "./sfxpart3.js?v=20261013-a";
import p4 from "./sfxpart4.js?v=20261013-a";
import p5 from "./sfxpart5.js?v=20261013-a";
// Original crowd recordings supplied for Time Clash; trimmed and combined.
// 0..2.15 s = disappointed crowd Ooh, 2.15..2.30 = silence, 2.30..4.65 = goal celebration.
export const CROWD_SPRITE_URL="data:audio/ogg;base64,"+[p0,p1,p2,p3,p4,p5].join("");
export const CROWD_SOUNDS=Object.freeze({ooh:{offset:0,duration:2.15},goal:{offset:2.30,duration:2.35}});