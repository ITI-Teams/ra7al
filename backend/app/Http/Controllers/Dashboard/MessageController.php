<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index()
    {
        $messages = Message::systemMessages()->latest()->paginate(15);
        return view('dashboard.messages.index', compact('messages'));
    }

    public function show(Message $message)
    {
        if (!$message->is_read) {
            $message->update(['is_read' => true, 'read_at' => now()]);
        }

        return view('dashboard.messages.show', compact('message'));
    }


    public function destroy(Message $message)
    {
        $message->delete();
        return redirect()->route('messages.index')->with('toast', ['type' => 'success','message' => 'Message deleted successfully!']);
    }


    public function trashed()
    {
        $messages = Message::onlyTrashed()->latest()->paginate(15);
        return view('dashboard.messages.trashed', compact('messages'));
    }


    public function restore($id)
    {
        $message = Message::onlyTrashed()->findOrFail($id);
        $message->restore();

        return redirect()->route('messages.index')->with('toast', ['type' => 'success','message' => 'Message restored successfully!']);
    }


    public function forceDelete($id)
    {
        $message = Message::onlyTrashed()->findOrFail($id);
        $message->forceDelete();

        return redirect()->route('messages.trashed')->with('toast', ['type' => 'success','message' => 'Message permanently deleted!']);
    }
}
