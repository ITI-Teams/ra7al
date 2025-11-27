<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Mail\ProfessionalMail;
use App\Models\User;
use App\Services\GmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MailController extends Controller
{
    protected $gmailService;

    public function __construct(GmailService $gmailService)
    {
        $this->gmailService = $gmailService;
    }

    public function index(Request $request)
    {
        $page = (int) $request->get('page', 1);
        $perPage = 15;

        $messages = $this->gmailService->getMessages($page, $perPage);

        $total = $messages['total_count'] ?? 0;
        $totalPages = ceil($total / $perPage);

        return view('dashboard.mail.index', [
            'messages' => $messages,
            'currentPage' => $page,
            'totalPages' => $totalPages,
        ]);
    }

    public function getMessage($id)
    {
        try {
            $message = $this->gmailService->getMessage($id);

            if (isset($message['error'])) {
                return response()->json([
                    'error' => $message['error'],
                    'subject' => 'Error Loading Message',
                    'from_email' => 'Error',
                    'text_body' => 'Unable to load message content.'
                ]);
            }

            $message = array_merge([
                'subject' => 'No Subject',
                'from_email' => 'No Sender',
                'from_name' => 'No Sender',
                'date' => now()->toDateTimeString(),
                'html_body' => null,
                'text_body' => 'No content available',
                'is_read' => true
            ], $message);

            return response()->json($message);

        } catch (\Exception $e) {
            \Log::error('Error fetching message: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch message: ' . $e->getMessage(),
                'subject' => 'Error',
                'from_email' => 'Error',
                'text_body' => 'Unable to load message content.'
            ], 500);
        }
    }

    public function sendEmail(Request $request)
    {
        $request->validate([
            'to_email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $details = [
            'title' => $request->subject,
            'body' => $request->message,
            'type' => 'professional'
        ];

        try {
            Mail::to($request->to_email)->send(new ProfessionalMail($details));
            return back()->with('success', 'Email sent successfully to ' . $request->to_email);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send email: ' . $e->getMessage());
        }
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
            'body' => $request->message,
            'type' => 'professional'
        ];

        try {
            Mail::to($user->email)->send(new ProfessionalMail($details));
            return back()->with('success', 'Email sent to ' . $user->name);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }
}
