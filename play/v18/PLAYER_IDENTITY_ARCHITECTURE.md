# Penalty Clash / Match Engine – Player Identity Architecture

## Grundsatz
MakeHuman/MPFB dient nur als parametrisierbare Körperbasis. Im finalen Spiel soll nicht "derselbe Mensch in anderem Trikot" verwendet werden.

Jeder reale oder historische Spieler erhält ein eigenes Profil, das zur Laufzeit auf denselben technischen Rig-Standard gemappt wird.

## PLAYER_PROFILE
- id
- display_name
- team_id / season_id
- height_m
- body_profile
  - shoulder_width
  - torso_length
  - leg_length
  - muscle
  - weight/build
- skin_profile
- head_asset
- hair_asset
- beard_asset optional
- dominant_foot
- kit_profile
- shirt_number
- animation_style
- reaction_profile

## KIT_PROFILE
Nationalmannschaften und Clubs werden separat gepflegt:
- shirt primary / secondary / pattern
- shorts
- socks
- boots
- collar / sleeve trim
- shirt number
- optional licensed crest/branding only when rights are cleared

## Match integration
Die Match Engine gibt beim Übergang ins Elfmeterschießen nicht nur team_id, sondern den konkreten Schützen und Torwart weiter:
- shooter_player_id
- goalkeeper_player_id
- team/season kit
- fatigue / confidence / pressure
- dominant foot
- current match context

Damit können historische Weltmeister, Clubs, Trainer-/Fantasy-Teams und aktuelle Mannschaften dieselbe Elfmeterschießen-Engine verwenden, ohne die Spieleridentität zu verlieren.

## V18
V18 ist nur der technische Körpertest:
- glatterer MakeHuman/MPFB-derived CC0 Basiskörper
- zonales Fußball-Kit
- aktueller Keeper bleibt
- noch keine reale Spieler-Likeness
