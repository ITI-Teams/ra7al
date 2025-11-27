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
    <div x-data="{
            viewOpen: false,
            sendOpen: false,
            message: null,
            targetEmail: '',
            isLoading: false
        }">

        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Inbox</h1>

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
                    <th class="px-4 py-3">Date</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
                </thead>

                <tbody id="tableData">
                @forelse($messages['messages'] ?? [] as $msg)
                    <tr class="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                        <td class="px-4 py-3">{{ $msg['from_email'] ?? 'No sender' }}</td>
                        <td class="px-4 py-3">{{ $msg['subject'] ?? 'No subject' }}</td>
                        <td class="px-4 py-3">{{ isset($msg['created_at']) ? date('Y-m-d H:i', strtotime($msg['created_at'])) : 'N/A' }}</td>
                        <td class="px-4 py-3 flex gap-2">
                            <button
                                @click="openViewModal({{ $msg['id'] }})"
                                class="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500">
                                View
                            </button>
                            <button
                                @click="sendOpen = true; targetEmail='{{ $msg['from_email'] ?? '' }}'"
                                class="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500">
                                Reply
                            </button>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                            No messages found
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
                           class="px-4 py-2 bg-gray-300 dark:bg-slate-700 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600">
                            Prev
                        </a>
                    @endif

                    <span class="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-lg">
                    Page {{ $currentPage }} of {{ $totalPages }}
                </span>

                    @if($currentPage < $totalPages)
                        <a href="?page={{ $next }}"
                           class="px-4 py-2 bg-gray-300 dark:bg-slate-700 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600">
                            Next
                        </a>
                    @endif
                </div>
            </div>
        @endif



        <!-- ===================== VIEW MESSAGE MODAL ===================== -->
        <div
            x-show="viewOpen"
            class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            x-transition>

            <div class="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-2xl shadow-lg mx-4">

                <h2 class="text-xl font-bold mb-3" x-text="message?.subject || 'No subject'"></h2>

                <p class="text-sm mb-3 text-gray-500" x-text="message?.from_email || 'No sender'"></p>

                <div class="border p-4 rounded-lg bg-gray-50 dark:bg-slate-700 max-h-96 overflow-y-auto"
                     x-html="message?.html_body || message?.text_body || 'No content available'">
                </div>

                <div class="flex justify-end mt-4">
                    <button
                        @click="viewOpen=false; message=null"
                        class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">
                        Close
                    </button>
                </div>

            </div>
        </div>



        <!-- ===================== SEND EMAIL MODAL ===================== -->
        <div
            x-show="sendOpen"
            class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            x-transition>

            <div class="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-lg shadow-lg mx-4">

                <h2 class="text-xl font-bold mb-4">Send Email</h2>

                <form method="POST" action="{{ route('mail.send') }}">
                    @csrf

                    <div class="mb-4">
                        <label class="block mb-1 text-sm font-medium">To</label>
                        <input type="email" name="to_email"
                               x-model="targetEmail"
                               required
                               placeholder="recipient@example.com"
                               class="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border dark:border-slate-600 focus:ring-2 focus:ring-indigo-500">
                    </div>

                    <div class="mb-4">
                        <label class="block mb-1 text-sm font-medium">Subject</label>
                        <input type="text" name="subject" required
                               placeholder="Email subject"
                               class="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border dark:border-slate-600 focus:ring-2 focus:ring-indigo-500">
                    </div>

                    <div class="mb-4">
                        <label class="block mb-1 text-sm font-medium">Message</label>
                        <textarea name="message" rows="6" required
                                  placeholder="Type your message here..."
                                  class="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border dark:border-slate-600 focus:ring-2 focus:ring-indigo-500"></textarea>
                    </div>

                    <div class="flex justify-end gap-3 mt-4">
                        <button type="button"
                                @click="sendOpen=false; targetEmail=''"
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-400">
                            Cancel
                        </button>

                        <button type="submit"
                                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex items-center gap-2">
                            <i class="fa fa-paper-plane"></i> Send
                        </button>
                    </div>
                </form>

            </div>
        </div>

    </div>





    <!-- JS Scripts -->
    <script>
        // search functionality
        document.getElementById('searchInput').addEventListener('keyup', function () {
            let filter = this.value.toLowerCase();
            let rows = document.querySelectorAll('#tableData tr');

            rows.forEach(row => {
                let text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });

        // open message modal
        function openViewModal(id) {
            // Show loading state
            const alpineData = document.querySelector('[x-data]').__x.$data;
            alpineData.isLoading = true;
            alpineData.viewOpen = true;

            // الطريقة الصحيحة لاستدعاء الـ route مع المعامل
            const url = '{{ route("mail.message", ":id") }}'.replace(':id', id);

            fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    alpineData.message = data;
                    alpineData.isLoading = false;
                })
                .catch(error => {
                    console.error('Error fetching message:', error);
                    alpineData.message = { subject: 'Error', from_email: 'Error', text_body: 'Failed to load message content.' };
                    alpineData.isLoading = false;
                });
        }
    </script>

</x-app-layout>
