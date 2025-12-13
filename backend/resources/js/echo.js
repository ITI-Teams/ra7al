import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

// Create Echo instance ONCE
if (!window.Echo) {
    window.Echo = new Echo({
        broadcaster: "pusher",
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true,
    });
}

// Attach listener ONCE
if (!window.__adminNotifListenerAttached) {
    window.__adminNotifListenerAttached = true;

    window.Echo.private("admin-notifications").notification((notification) => {
        console.log("Admin notification:", notification);

        window.dispatchEvent(
            new CustomEvent("admin-notification", {
                detail: notification,
            })
        );
    });
}
