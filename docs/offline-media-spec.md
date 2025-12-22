# Offline Media Strategy: Service Worker & IndexedDB Spec

This spec details the implementation of the **Photo Cache Policy** for Arboria 3.0, ensuring instant image verification in the field.

## 1. Request Interception (Service Worker)
- **Scope:** Requests to `https://*.supabase.co/storage/v1/object/public/tree-photos/*`.
- **Strategy:** `Cache-First` for thumbnails, `Network-First` for full-resolution images.

## 2. Storage Architecture (IndexedDB)
We use IndexedDB via **idb-keyval** for better performance and capacity than Cache API.

### Schema: `tree-media-db`
- **Store Name:** `thumbnails`
- **Key:** `tree_id` (UUID)
- **Value Object:**
  ```json
  {
    "blob": Blob (WebP),
    "mimetype": "image/webp",
    "timestamp": Number (last_accessed),
    "instalacao_id": UUID
  }
  ```

## 3. LRU Eviction Policy
To prevent storage bloat (Winston's concern):
1. **Quota Check:** On every store, check if `thumbnails.length > 1000`.
2. **Eviction:** If over quota, sort by `timestamp` and delete the oldest 100.
3. **Contextual Wipe:** When `active_instalacao_id` changes (login/switch), delete all records where `instalacao_id` does not match the new one.

## 4. Interaction Flow
1. `TreeKeycard` requests image.
2. Service Worker intercepts.
3. If in IndexedDB -> Return 200 from Blob.
4. If not in IndexedDB -> Fetch from Supabase -> **Transcode to 200x200 WebP** in worker -> Save to IndexedDB -> Return original stream.
