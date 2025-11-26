<div
    x-data="{ open: false, actionUrl: '' }"
    x-cloak
>
    <!-- Trigger Event -->
    <div @confirm-delete.window="
        actionUrl = $event.detail.url;
        open = true;
    "></div>

    <!-- Modal -->
    <div
        x-show="open"
        x-transition.opacity
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
        <div
            class="bg-white dark:bg-slate-800 rounded-xl p-6 w-96 shadow-lg border dark:border-slate-700"
            x-transition
        >
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Confirm Delete
            </h2>

            <p class="mb-6 text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this user?
            </p>

            <div class="flex justify-end gap-3">
                <button
                    @click="open = false"
                    class="px-4 py-2 bg-gray-300 dark:bg-slate-700 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600">
                    Cancel
                </button>

                <form :action="actionUrl" method="POST">
                    @csrf
                    @method('DELETE')

                    <button
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">
                        Delete
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
