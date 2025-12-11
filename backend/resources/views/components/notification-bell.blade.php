<div id="notification-bell" class="relative cursor-pointer">
    <span id="bell-icon" class="text-2xl">🔔</span>

    {{-- Red dot --}}
    <span id="notif-dot" class="hidden absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></span>

    {{-- Dropdown --}}
    <div id="notif-dropdown" class="hidden absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-3 z-50">
        <h4 class="font-bold mb-2">Notifications</h4>
        <ul id="notif-list" class="max-h-64 overflow-y-auto text-sm">
            <li class="text-gray-500">No notifications</li>
        </ul>
    </div>
</div>

@push('scripts')

<script>
    Pusher.logToConsole = true;

  


    // Subscribe to public channel
    const channel = pusher.subscribe("admins-notifications");

    channel.bind("App\\Notifications\\PropertyCreatedNotification", function(data) {
        console.log("Public notification received:", data);

        const dot = document.getElementById("notif-dot");
        const list = document.getElementById("notif-list");

        dot.classList.remove("hidden");

        if (list.children.length === 1 && list.children[0].innerText === "No notifications") {
            list.innerHTML = "";
        }

        const item = document.createElement("li");
        item.className = "p-2 border-b";
        item.textContent = data.message;

        list.prepend(item);
    });

    // Toggle dropdown
    document.getElementById("notification-bell").addEventListener("click", () => {
        const dropdown = document.getElementById("notif-dropdown");
        dropdown.classList.toggle("hidden");

        if (!dropdown.classList.contains("hidden")) {
            document.getElementById("notif-dot").classList.add("hidden");
        }
    });
</script>

@endpush