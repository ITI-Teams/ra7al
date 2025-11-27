<x-app-layout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">{{ $message->subject }}</h1>
            <div class="flex gap-2">
                <a href="{{ route('messages.index') }}"
                   class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500">
                    Back to Messages
                </a>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div class="p-6">
                <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
                    <div>
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
                        <span class="ml-2 px-3 py-1 rounded-full text-sm {{
                            $message->is_read ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }}">
                            {{ $message->is_read ? 'Read' : 'Unread' }}
                        </span>
                    </div>
                    <div class="text-sm text-gray-500">
                        Created: {{ $message->created_at->format('M d, Y H:i') }}
                        @if($message->read_at)
                            | Read: {{ $message->read_at->format('M d, Y H:i') }}
                        @endif
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 class="text-lg font-semibold mb-2">From</h3>
                        <p class="font-medium">{{ $message->sender_name }}</p>
                        <p class="text-gray-600 dark:text-gray-400">{{ $message->sender_email }}</p>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-2">To</h3>
                        <p class="font-medium">{{ $message->recipient_name }}</p>
                        <p class="text-gray-600 dark:text-gray-400">{{ $message->recipient_email }}</p>
                    </div>
                </div>

                <div class="prose dark:prose-invert max-w-none">
                    {!! nl2br(e($message->content)) !!}
                </div>
            </div>
        </div>

        <div class="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Message Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Subject</p>
                    <p class="font-medium">{{ $message->subject }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Priority</p>
                    <p class="font-medium">{{ ucfirst($message->priority) }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Created</p>
                    <p class="font-medium">{{ $message->created_at->format('M d, Y H:i') }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Updated</p>
                    <p class="font-medium">{{ $message->updated_at->format('M d, Y H:i') }}</p>
                </div>
            </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
            <form action="{{ route('messages.destroy', $message) }}" method="POST" class="inline">
                @csrf
                @method('DELETE')
                <button
                    type="button"
                    @click="$dispatch('confirm-delete', { url: '{{ route('messages.destroy', $message->id) }}' })"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-500">
                    Delete Message
                </button>
            </form>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div x-data="{ open: false, deleteUrl: '' }"
         x-show="open"
         @confirm-delete.window="open = true; deleteUrl = $event.detail.url"
         class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
         x-transition>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md mx-4">
            <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p class="mb-6">Are you sure you want to delete this message? This action will move the message to trash.</p>

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
</x-app-layout>
