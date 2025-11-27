<x-app-layout>

    <!-- Success Toast -->
    @if(session('success'))
        <div x-data="{ show: true }"
             x-show="show"
             x-init="setTimeout(() => show=false, 3000)"
             class="fixed top-5 right-5 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50">
            {{ session('success') }}
        </div>
    @endif

    <!-- Error Toast -->
    @if(session('error'))
        <div x-data="{ show: true }"
             x-show="show"
             x-init="setTimeout(() => show=false, 5000)"
             class="fixed top-5 right-5 bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg z-50">
            {{ session('error') }}
        </div>
    @endif

    <!-- Alpine.js Global Modals and Data -->
    <div x-data="mailApp()">

        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Gmail Inbox</h1>

            <button
                @click="sendOpen = true; targetEmail = ''"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500 flex items-center gap-2">
                <i class="fa fa-paper-plane"></i> Send Email
            </button>
        </div>

        <!-- Search -->
        <div class="mb-4">
            <input id="searchInput"
                   type="text"
                   placeholder="Search by sender or subject..."
                   class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:ring focus:ring-indigo-300 dark:text-white">
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
            <table class="w-full text-left">
                <thead class="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
                <tr>
                    <th class="px-4 py-3">Sender</th>
                    <th class="px-4 py-3">Subject</th>
                    <th class="px-4 py-3">Preview</th>
                    <th class="px-4 py-3">Date</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
                </thead>

                <tbody id="tableData">
                @forelse($messages['messages'] ?? [] as $msg)
                    <tr class="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition {{ $msg['is_read'] ?? true ? '' : 'bg-blue-50 dark:bg-blue-900/20 font-semibold' }}">
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                                    <span class="text-indigo-600 dark:text-indigo-300 text-sm font-medium">
                                        {{ substr($msg['from_name'] ?? $msg['from_email'] ?? 'U', 0, 1) }}
                                    </span>
                                </div>
                                <div>
                                    <div class="font-medium">{{ $msg['from_name'] ?? 'Unknown Sender' }}</div>
                                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ $msg['from_email'] ?? 'No email' }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3 font-medium">{{ $msg['subject'] ?? 'No subject' }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {{ $msg['snippet'] ?? 'No preview available' }}
                        </td>
                        <td class="px-4 py-3 text-sm">
                            {{ isset($msg['date']) ? \Carbon\Carbon::parse($msg['date'])->format('M j, Y g:i A') : 'N/A' }}
                        </td>
                        <td class="px-4 py-3 flex gap-2">
                            <button
                                @click="openViewModal('{{ $msg['id'] }}')"
                                class="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500 flex items-center gap-1">
                                <i class="fa fa-eye"></i> View
                            </button>
                            <button
                                @click="sendOpen = true; targetEmail='{{ $msg['from_email'] ?? '' }}'"
                                class="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 flex items-center gap-1">
                                <i class="fa fa-reply"></i> Reply
                            </button>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <div class="flex flex-col items-center justify-center">
                                <i class="fa fa-inbox text-4xl mb-4 text-gray-300"></i>
                                <p class="text-lg mb-2">No messages found</p>
                                <p class="text-sm">Your Gmail inbox is empty or there was an error loading messages.</p>
                                @if(isset($messages['error']))
                                    <p class="text-sm text-red-500 mt-2">Error: {{ $messages['error'] }}</p>
                                @endif
                            </div>
                        </td>
                    </tr>
                @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if(($messages['total_count'] ?? 0) > 0)
            <div class="mt-6 flex justify-center">
                @php
                    $prev = $currentPage - 1;
                    $next = $currentPage + 1;
                @endphp

                <div class="flex gap-2">
                    @if($currentPage > 1)
                        <a href="?page={{ $prev }}"
                           class="px-4 py-2 bg-gray-300 dark:bg-slate-700 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600 flex items-center gap-2">
                            <i class="fa fa-chevron-left"></i> Prev
                        </a>
                    @endif

                    <span class="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-lg">
                        Page {{ $currentPage }} of {{ $totalPages }}
                    </span>

                    @if($currentPage < $totalPages)
                        <a href="?page={{ $next }}"
                           class="px-4 py-2 bg-gray-300 dark:bg-slate-700 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600 flex items-center gap-2">
                            Next <i class="fa fa-chevron-right"></i>
                        </a>
                    @endif
                </div>
            </div>
        @endif

        <!-- View Message Modal -->
        <div
            x-show="viewOpen"
            x-cloak
            class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            x-transition>

            <div class="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-4xl shadow-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">

                <!-- Loading State -->
                <div x-show="isLoading" class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span class="ml-3 text-gray-600 dark:text-gray-400">Loading message...</span>
                </div>

                <!-- Error State -->
                <div x-show="!isLoading && message && message.error" class="py-8 text-center">
                    <i class="fa fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Error Loading Message</h3>
                    <p class="text-gray-600 dark:text-gray-400" x-text="message.error"></p>
                    <button
                        @click="viewOpen = false; message = null"
                        class="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">
                        Close
                    </button>
                </div>

                <!-- Message Content -->
                <div x-show="!isLoading && message && !message.error" class="flex flex-col h-full">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <h2 class="text-xl font-bold" x-text="message.subject ? message.subject : 'No subject'"></h2>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                From: <span x-text="message.from_name ? message.from_name : (message.from_email ? message.from_email : 'No sender')"></span>
                                <template x-if="message.from_email && message.from_name !== message.from_email">
                                    (<span x-text="message.from_email"></span>)
                                </template>
                            </p>
                            <p class="text-sm text-gray-500 dark:text-gray-400"
                               x-text="message.date ? new Date(message.date).toLocaleString() : 'No date'"></p>
                        </div>
                        <button
                            @click="viewOpen = false; message = null"
                            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-4">
                            <i class="fa fa-times text-xl"></i>
                        </button>
                    </div>

                    <div class="border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 flex-1 overflow-y-auto">
                        <div class="p-4" x-html="message.html_body ? message.html_body : (message.text_body ? message.text_body : 'No content available')"></div>
                    </div>

                    <div class="flex justify-end gap-3 mt-4 pt-4 border-t dark:border-slate-600">
                        <button
                            @click="sendOpen = true; targetEmail = message.from_email ? message.from_email : ''; viewOpen = false"
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 flex items-center gap-2">
                            <i class="fa fa-reply"></i> Reply
                        </button>
                        <button
                            @click="viewOpen = false; message = null"
                            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">
                            Close
                        </button>
                    </div>
                </div>

                <!-- No Message State -->
                <div x-show="!isLoading && !message" class="py-8 text-center">
                    <i class="fa fa-envelope text-gray-400 text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Message Selected</h3>
                    <button
                        @click="viewOpen = false"
                        class="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">
                        Close
                    </button>
                </div>

            </div>
        </div>

        <!-- Send Email Modal -->
        <div
            x-show="sendOpen"
            x-cloak
            class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            x-transition>

            <div class="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-2xl shadow-lg mx-4">

                <h2 class="text-xl font-bold mb-4">Send Email</h2>

                <form method="POST" action="{{ route('mail.send') }}">
                    @csrf

                    <div class="mb-4">
                        <label class="block mb-2 text-sm font-medium">To</label>
                        <input type="email" name="to_email"
                               x-model="targetEmail"
                               required
                               placeholder="recipient@example.com"
                               class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>

                    <div class="mb-4">
                        <label class="block mb-2 text-sm font-medium">Subject</label>
                        <input type="text" name="subject" required
                               placeholder="Email subject"
                               class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>

                    <div class="mb-4">
                        <label class="block mb-2 text-sm font-medium">Message</label>
                        <textarea name="message" rows="8" required
                                  placeholder="Type your professional message here..."
                                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></textarea>
                    </div>

                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button"
                                @click="sendOpen = false; targetEmail = ''"
                                class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-400 transition">
                            Cancel
                        </button>

                        <button type="submit"
                                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex items-center gap-2 transition">
                            <i class="fa fa-paper-plane"></i> Send Email
                        </button>
                    </div>
                </form>

            </div>
        </div>

    </div>

    <!-- JS Scripts -->
    <script>
        // Define mailApp function for Alpine.js
        function mailApp() {
            return {
                viewOpen: false,
                sendOpen: false,
                message: null,
                targetEmail: '',
                isLoading: false,

                // Open message modal method
                openViewModal(id) {
                    if (!id) {
                        console.error('Message ID is required');
                        return;
                    }

                    this.isLoading = true;
                    this.viewOpen = true;
                    this.message = null;

                    // بناء الـ URL بشكل صحيح
                    const baseUrl = '{{ route("mail.message", ["id" => "PLACEHOLDER"]) }}';
                    const url = baseUrl.replace('PLACEHOLDER', id);

                    console.log('Fetching message from:', url);

                    fetch(url)
                        .then(res => {
                            if (!res.ok) {
                                throw new Error('Network response was not ok: ' + res.status);
                            }
                            return res.json();
                        })
                        .then(data => {
                            this.message = data;
                            this.isLoading = false;
                        })
                        .catch(error => {
                            console.error('Error fetching message:', error);
                            this.message = {
                                error: 'Failed to load message: ' + error.message,
                                subject: 'Error',
                                from_email: 'Error',
                                text_body: 'Unable to load message content. Please try again.'
                            };
                            this.isLoading = false;
                        });
                }
            }
        }

        // Search functionality
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('keyup', function() {
                    let filter = this.value.toLowerCase();
                    let rows = document.querySelectorAll('#tableData tr');

                    rows.forEach(row => {
                        let text = row.textContent.toLowerCase();
                        row.style.display = text.includes(filter) ? '' : 'none';
                    });
                });
            }

            // Debug: Check if Alpine is available
            if (typeof Alpine !== 'undefined') {
                console.log('Alpine.js is available');
            } else {
                console.error('Alpine.js is not available');
            }
        });

        // Fallback global function (for compatibility)
        function openViewModal(id) {
            if (!id) {
                console.error('Message ID is required for openViewModal');
                return;
            }

            // Try to find Alpine component and call its method
            const alpineElement = document.querySelector('[x-data="mailApp()"]');
            if (alpineElement && alpineElement.__x) {
                alpineElement.__x.$data.openViewModal(id);
            } else {
                console.error('Alpine.js mailApp not found or not initialized');
                // Fallback: redirect to message page (if you want a separate page)
                // window.location.href = '{{ url("mail/message") }}/' + id;
            }
        }
    </script>

    <style>
        [x-cloak] { display: none !important; }
    </style>

</x-app-layout>
