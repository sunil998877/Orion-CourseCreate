const store = new Map();
export async function withCache(key, ttlMs, loader) {
    const now = Date.now();
    const hit = store.get(key);
    if (hit) {
        if (hit.data !== undefined && now < hit.expires)
            return hit.data;
        if (hit.pending)
            return hit.pending;
    }
    const pending = Promise.resolve()
        .then(loader)
        .then((data) => {
        store.set(key, { data, expires: Date.now() + ttlMs });
        return data;
    })
        .catch((err) => {
        store.delete(key);
        throw err;
    });
    store.set(key, { pending, expires: now + ttlMs });
    return pending;
}
export function invalidateAdminCache(prefix = "") {
    if (!prefix) {
        store.clear();
        return;
    }
    for (const key of store.keys()) {
        if (key.startsWith(prefix))
            store.delete(key);
    }
}
