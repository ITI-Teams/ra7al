<x-app-layout>
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">System Messages</h1>

        <div class="flex gap-3">
            <a href="{{ route('messages.trashed') }}"
               class="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-500">
                <i class="fa fa-trash"></i> Trashed
            </a>
        </div>
    </div>

    <!-- Search -->
    <div class="mb-4">
        <input id="searchInput"
               type="text"
               placeholder="Search system messages..."
               class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:ring focus:ring-indigo-300 dark:text-white">
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
        <table class="w-full text-left">
            <thead class="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
            <tr>
                <th class="px-4 py-3">Subject</th>
                <th class="px-4 py-3">Sender</th>
                <th class="px-4 py-3">Priority</th>
                <th class="px-4 py-3">Type</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Created</th>
                <th class="px-4 py-3">Actions</th>
            </tr>
            </thead>

            <tbody id="tableData">
            @forelse($messages as $message)
                <tr class="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                    <td class="px-4 py-3 font-medium">
                        {{ Str::limit($message->subject, 30) }}
                        @unless($message->is_read)
                            <span class="ml-2 text-red-500">
                                <i class="fas fa-circle text-xs"></i>
                            </span>
                        @endunless
                    </td>
                    <td class="px-4 py-3">
                        <div class="text-sm">{{ $message->sender_name }}</div>
                        <div class="text-xs text-gray-500">{{ $message->sender_email }}</div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs {{
                                ($message->priority === 'urgent')
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : (($message->priority === 'high')
                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                        : (($message->priority === 'normal')
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'))
                            }}">
                            {{ ucfirst($message->priority) }}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                            System Message
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs {{
                            ($message->is_read) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }}">
                            {{ $message->is_read ? 'Read' : 'Unread' }}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        {{ $message->created_at ? $message->created_at->format('M d, Y') : 'No date' }}
                    </td>
                    <td class="px-4 py-3 flex gap-2">

                        <a href="{{ route('messages.show', $message->id) }}"
                           class="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500">
                            View
                        </a>
                        <form action="{{ route('messages.destroy', $message->id) }}" method="POST" class="inline">
                            @csrf
                            @method('DELETE')
                            <button
                                type="button"
                                @click="$dispatch('confirm-delete', { url: '{{ route('messages.destroy', $message->id) }}' })"
                                class="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500">
                                Delete
                            </button>
                        </form>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                        No system messages found
                    </td>
                </tr>
            @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6">
        {{ $messages->links() }}
    </div>

    <!-- JS Search -->
    <script>
        document.getElementById('searchInput').addEventListener('keyup', function () {
            let filter = this.value.toLowerCase();
            let rows = document.querySelectorAll('#tableData tr');

            rows.forEach(row => {
                row.style.display =
                    row.textContent.toLowerCase().includes(filter)
                        ? '' : 'none';
            });
        });
    </script>
</x-app-layout>

<!-- Delete Confirmation Modal -->
<div x-data="{ open: false, deleteUrl: '' }"
     x-show="open"
     @confirm-delete.window="open = true; deleteUrl = $event.detail.url"
     class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
     x-transition>

    <div class="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p class="mb-6">Are you sure you want to delete this system message? This action will move the message to trash.</p>

        <div class="flex justify-end gap-3">
            <button
                @click="open = false"
                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">
                Cancel
            </button>
            <form :action="deleteUrl" method="POST" class="inline">
                @csrf
                @method('DELETE')
                <button
                    type="submit"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">
                    Delete
                </button>
            </form>
        </div>
    </div>
</div>
