# Penalty Clash V17B – Character Model Specification

## Ziel
V17B ersetzt den bisherigen Quaternius-Animated-Men-Platzhalter durch einen eigenständigen, neutralen Fußballer-Basiskörper mit echter Kurzarm-Silhouette und deutlich glatterer Geometrie.

## Pflichtanforderungen
- Format: GLB / glTF 2.0
- Maßstab: Meter, Spieler-Basishöhe 1.80 m
- Zielbudget Browser/Mobile: 30k–60k Dreiecke pro Feldspieler
- LOD0 optional bis ca. 80k, aber nicht als einzige Mobile-Version
- Rig: humanoid, symmetrische Benennung, separate Hand-/Fuß-/Kopf-Bones
- AnimationMixer-kompatibel in Three.js
- Separate Meshes/Materialslots:
  - skin
  - hair
  - eyes
  - shirt_body
  - shirt_sleeve_L
  - shirt_sleeve_R
  - shorts
  - socks
  - boots
  - goalkeeper_gloves
- Shirt wirklich kurzärmelig modelliert; kein Shader-Trick als finale Lösung.
- Saubere Schulter-, Ellbogen-, Knie- und Hüft-Topologie.
- Smooth normals + PBR roughness/normal maps.
- Keine Vereins-/Verbandslogos oder Sponsorzeichen im Basismodell.

## Animationen
Mindestens:
- Idle
- Walk
- Run
- RunUp
- Kick_Right
- Kick_Left
- FollowThrough
- Celebrate_01..08
- Frustration_Save_01..05
- Frustration_Post_01..04
- Frustration_Miss_01..03
- GK_Ready
- GK_Shuffle_Left
- GK_Shuffle_Right
- GK_Dive_Left_Low / High
- GK_Dive_Right_Low / High
- GK_Catch
- GK_Deflect
- GK_Land
- GK_Recover

## V17B Integrationsregel
Die Spielphysik aus V16/V17A bleibt unverändert:
- goalLineZ = 0
- savePlaneZ vor der Linie
- Side-Cam bleibt
- Ballkontakt/Power/Zielsystem bleibt
- spätere BetInsight-Stadien werden über BETINSIGHT_STADIUM_ENVIRONMENT geladen

## Modellstrategie
Priorität:
1. neutralen generischen Fußballer mit kurzer Spielkleidung als eigenes BetInsight-Basismodell erzeugen/erwerben;
2. Retopologie auf Web-Budget;
3. humanoid riggen;
4. Materialslots wie oben trennen;
5. erst danach individuelle Köpfe/Haare auf denselben Körper setzen.

Nicht als finale Lösung verwenden:
- Celebrity-Likeness aus einem einzelnen Foto;
- 200k+ Dreiecke als einziges Webmodell;
- einteilige Ganzkörper-Materialien ohne getrennte Kit-Bereiche;
- Modelle ohne Hand-Bones oder ohne kommerziell klare Lizenz.
