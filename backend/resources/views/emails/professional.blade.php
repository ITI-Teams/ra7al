<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $details['title'] }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }

        .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.025em;
        }

        .email-body {
            padding: 40px 30px;
            color: #4a5568;
        }

        .email-content {
            font-size: 16px;
            line-height: 1.7;
        }

        .email-footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            color: #718096;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }

        .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }

        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: all 0.3s ease;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
<div class="email-container">
    <div class="email-header">
        <div class="logo">{{ config('app.name', 'Ra7al') }}</div>
        <h1>{{ $details['title'] }}</h1>
    </div>

    <div class="email-body">
        <div class="email-content">
            {!! nl2br(e($details['body'])) !!}
        </div>

        @if(isset($details['button_url']))
            <div style="text-align: center;">
                <a href="{{ $details['button_url'] }}" class="btn">
                    {{ $details['button_text'] ?? 'Take Action' }}
                </a>
            </div>
        @endif

        <div class="signature">
            <p>Best regards,<br>
                <strong>The {{ config('app.name', 'Ra7al') }} Team</strong></p>
        </div>
    </div>

    <div class="email-footer">
        <p>&copy; {{ date('Y') }} {{ config('app.name', 'Ra7al') }}. All rights reserved.</p>
        <p>This email was sent from our automated system. Please do not reply to this email.</p>
        <p style="margin-top: 10px; font-size: 12px; color: #a0aec0;">
            If you have any questions, contact our support team.
        </p>
    </div>
</div>
</body>
</html>
