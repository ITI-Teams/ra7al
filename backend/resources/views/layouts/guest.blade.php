<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    <style>
        /* Autofill fix for Chrome, Edge, Safari */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0px 1000px #14141f inset !important;
            /* background color */
            -webkit-text-fill-color: #ffffff !important;
            /* text color */
            box-shadow: inset 0 0 6px rgba(212, 175, 55, 0.2) !important;
            /* your gold inner glow */
            border-image: linear-gradient(to bottom, #D4AF37 0%, #C49A2C 35%, #8F6A15 80%, #5E450C 100%) 1 !important;
            background-clip: padding-box !important;
            /* ensures bg fills inside the border */
            transition: background-color 5000s ease-in-out 0s;
            /* prevents flash */
        }
    </style>
    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="font-sans text-gray-900 antialiased">
    {{ $slot }}
</body>

</html>