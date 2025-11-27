<div
    x-data="{ show: false, message: '', type: 'success' }"
    x-init="
        @if(session('toast'))
            message = '{{ session('toast.message') }}';
            type = '{{ session('toast.type') }}';
            show = true;
            setTimeout(() => show = false, 3000);
        @endif
    "
    x-show="show"
    x-transition
    x-cloak
    class="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white"
    :class="{
        'bg-green-600': type === 'success',
        'bg-red-600': type === 'error',
        'bg-yellow-600': type === 'warning'
    }"
>
    <span x-text="message"></span>
</div>
