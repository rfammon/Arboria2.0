# Collaborative Presence Specification

This spec details the **Live Occupation** system for Arboria 3.0, used to alert users when others are editing the same record.

## 1. Technology: Supabase Realtime (Presence)
We leverage Supabase's Presence protocol for low-latency, transient state synchronization.

## 2. Presence Object Schema
Every client joined to an `instalacao_id` channel will broadcast the following state:

```json
{
  "user_id": "UUID (auth.uid)",
  "user_name": "String (display_name)",
  "active_tree_id": "UUID | null",
  "status": "String (viewing | editing)",
  "timestamp": "ISO-8601 (last_heartbeat)"
}
```

## 3. Interaction Logic
- **On Blade/Drawer Open:** Join/Update Presence with `active_tree_id = tree.id` and `status = viewing`.
- **On First Change:** Update Presence with `status = editing`.
- **On Close:** Update Presence with `active_tree_id = null`.

## 4. UI logic (The Badge)
- Client listens to `presence_state`.
- Filter state by `tree_id`.
- If `tree_id` has other users with `status == editing`: 
  Show Badge: **"{{user_name}} está editando..."**
- If `tree_id` has other users with `status == viewing`: 
  Show Badge: **"{{user_name}} está visualizando..."** (Optional/Secondary).
