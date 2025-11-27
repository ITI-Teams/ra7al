<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Mail\TestMail;
use App\Models\User;
use App\Services\MailtrapService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MailController extends Controller
{
    public function index(Request $request, MailtrapService $mailtrap)
    {
        $page = (int) $request->get('page', 1);

        $messages = $mailtrap->getMessages($page);

        $perPage = 30;
        $total = $messages['total_count'] ?? 0;
        $totalPages = ceil($total / $perPage);

        return view('dashboard.mail.index', [
            'messages' => $messages,
            'currentPage' => $page,
            'totalPages' => $totalPages
        ]);
    }

    public function getMessage($id, MailtrapService $mailtrap)
    {
        $message = $mailtrap->getMessage($id);
        return response()->json($message);
    }

    // دالة جديدة لإرسال البريد الإلكتروني
    public function sendEmail(Request $request)
    {
        $request->validate([
            'to_email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $details = [
            'title' => $request->subject,
            'body' => $request->message
        ];

        try {
            Mail::to($request->to_email)->send(new TestMail($details));
            return back()->with('success', 'Email sent successfully to ' . $request->to_email);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }

    // دالة جديدة لإرسال البريد الإلكتروني


    public function sendTestEmail()
    {
        $details = [
            'title' => 'Hello from Laravel',
            'body' => 'This is a test email!'
        ];

        Mail::to('abdullahshokr70@gmail.com')->send(new TestMail($details));

        return back()->with('success', 'Test email sent successfully!');
    }

    public function sendToUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $user = User::findOrFail($request->user_id);

        $details = [
            'title' => $request->subject,
            'body' => $request->message
        ];

        Mail::to($user->email)->send(new TestMail($details));

        return back()->with('success', 'Email sent to ' . $user->name);
    }

    public function show(string $id)
    {
        return "Message ID: " . $id;
    }

    public function destroy(string $id)
    {
        return back()->with('success', 'Message deleted!');
    }
}
