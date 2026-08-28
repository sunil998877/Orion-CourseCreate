export function clearAdminSession() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminUsername");
}
export function hasAdminSession() {
    return Boolean(localStorage.getItem("adminToken"));
}
