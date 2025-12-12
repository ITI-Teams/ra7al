<div id="notification-bell" class="relative cursor-pointer select-none">
    <!-- Bell -->
    <span id="bell-icon" class="text-2xl">🔔</span>

    <!-- Red Dot -->
    <span id="notif-dot" class="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full hidden"></span>

    <!-- Dropdown -->
    <div id="notif-dropdown" class="hidden absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg p-3 z-50">
        <h4 class="font-bold mb-3 text-gray-700">Notifications</h4>
        <ul id="notif-list" class="max-h-64 overflow-y-auto space-y-2 text-sm">
            <li id="no-notif-text" class="text-gray-400 text-center py-2">No notifications</li>
        </ul>
    </div>
</div>

@push('scripts')
<script>
    document.addEventListener("DOMContentLoaded", function() {
    if (!window.Echo) {
        console.error("Laravel Echo is not loaded");
        return;
    }

    const notifDot = document.getElementById("notif-dot");
    const notifList = document.getElementById("notif-list");
    const emptyText = document.getElementById("no-notif-text");

    // Listen to private channel
    Echo.private("admin-notifications")
        .notification((notification) => {
            console.log("Notification received:", notification);

            notifDot.classList.remove("hidden");
            if (emptyText) emptyText.remove();

            const li = document.createElement("li");
            li.className = "p-2 bg-gray-50 rounded-lg border border-gray-200";
            li.innerHTML = `
                <div class="font-semibold">${notification.title ?? "New Update"}</div>
                <div class="text-gray-600 text-xs">${notification.message}</div>
            `;
            notifList.prepend(li);
        });

    // Toggle dropdown
    document.getElementById("notification-bell").addEventListener("click", () => {
        const dropdown = document.getElementById("notif-dropdown");
        dropdown.classList.toggle("hidden");

        if (!dropdown.classList.contains("hidden")) {
            notifDot.classList.add("hidden");
        }
    });
});
</script>
@endpush