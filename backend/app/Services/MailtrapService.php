<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MailtrapService
{
    public function getMessages($page = 1)
    {
        $token = env('MAILTRAP_TOKEN');
        $account = env('MAILTRAP_ACCOUNT');
        $inbox = env('MAILTRAP_INBOX');

        $url = "https://mailtrap.io/api/accounts/{$account}/inboxes/{$inbox}/messages?page={$page}";

        $response = Http::withToken($token)->get($url);

        if ($response->failed()) {
            return [];
        }

        return $response->json();
    }


    public function getMessage($id)
    {
        $token = env('MAILTRAP_TOKEN');
        $account = env('MAILTRAP_ACCOUNT');
        $inbox = env('MAILTRAP_INBOX');

        $url = "https://mailtrap.io/api/accounts/{$account}/inboxes/{$inbox}/messages/{$id}";

        $response = Http::withToken($token)->get($url);

        return $response->json();
    }
}
