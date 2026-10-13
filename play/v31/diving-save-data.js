// V31: ACTUAL keyframe sample, extracted from user-uploaded Goalkeeper Diving Save.fbx.
// One Mixamo clip only, FBX rotation XYZ in tenths of degrees, 24 sample times.
// Retargeting is experimental: visual only; match calculations remain unchanged.
const encoded="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";
export const ONE_MIXAMO_BONES=["Hips","Spine","Spine1","Spine2","RightShoulder","LeftShoulder","RightArm","LeftArm","RightForeArm","LeftForeArm","RightUpLeg","LeftUpLeg","RightLeg","LeftLeg"];
export async function loadOneDivingSave(){
  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
  const body=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
  const decoded=await new Response(body).arrayBuffer();
  const values=new DataView(decoded);
  const frames=24,boneCount=ONE_MIXAMO_BONES.length;
  if(decoded.byteLength!==boneCount*frames*3*2)throw Error("Mixamo clip incomplete");
  const bones={};
  for(let b=0;b<boneCount;b++){
    const angles=[];
    for(let f=0;f<frames;f++){
      const off=(b*frames*3+f*3)*2;
      angles.push([values.getInt16(off,true)/10,values.getInt16(off+2,true)/10,values.getInt16(off+4,true)/10]);
    }
    bones[ONE_MIXAMO_BONES[b]]=angles;
  }
  return {source:"Goalkeeper Diving Save.fbx", frames, seconds:3.2333333333333334, bones};
}
