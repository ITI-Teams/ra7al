<?php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;
use Illuminate\Support\Facades\Cache;

class GmailService
{
    protected $client;
    protected $service;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setAuthConfig(storage_path('app/credentials.json'));
        $this->client->addScope(Gmail::GMAIL_READONLY);
        $this->client->setAccessType('offline');
        $tokenPath = storage_path('app/gmail_token.json');
        if (file_exists($tokenPath)) {
            $this->client->setAccessToken(json_decode(file_get_contents($tokenPath), true));
        }
        $this->service = new Gmail($this->client);
    }

    public function getMessages($page = 1, $perPage = 15)
    {
        $cacheKey = "gmail_messages_page_{$page}_perpage_{$perPage}";

        return Cache::remember($cacheKey, 300, function () use ($page, $perPage) {
            try {
                $optParams = [
                    'maxResults' => $perPage,
                    'labelIds' => ['INBOX'],
                    'q' => 'is:unread OR is:read'
                ];

                if ($page > 1) {
                    // للحصول على الصفحات التالية، تحتاج لتطبيق الـ pagination
                    $optParams['pageToken'] = $this->getPageToken($page);
                }

                $messages = $this->service->users_messages->listUsersMessages('me', $optParams);

                $formattedMessages = [];
                foreach ($messages->getMessages() as $message) {
                    $formattedMessages[] = $this->formatMessage($message->getId());
                }

                return [
                    'messages' => $formattedMessages,
                    'total_count' => $messages->getResultSizeEstimate() ?? 0
                ];

            } catch (\Exception $e) {
                return [
                    'messages' => [],
                    'total_count' => 0,
                    'error' => $e->getMessage()
                ];
            }
        });
    }

    public function getMessage($id)
    {
        try {
            $message = $this->service->users_messages->get('me', $id);
            return $this->formatMessageDetails($message);
        } catch (\Exception $e) {
            return ['error' => 'Failed to fetch message: ' . $e->getMessage()];
        }
    }

    private function formatMessageDetails($message)
    {
        $payload = $message->getPayload();
        $headers = $payload->getHeaders();

        return [
            'id' => $message->getId(),
            'subject' => $this->getHeader($headers, 'Subject'),
            'from_email' => $this->getHeader($headers, 'From'),
            'from_name' => $this->extractName($this->getHeader($headers, 'From')),
            'date' => $this->getHeader($headers, 'Date'),
            'html_body' => $this->getMessageBody($message),
            'text_body' => $message->getSnippet(),
            'is_read' => !in_array('UNREAD', $message->getLabelIds())
        ];
    }

    private function getMessageBody($message)
    {
        $parts = $message->getPayload()->getParts();

        if (empty($parts)) {
            return nl2br(htmlspecialchars($message->getSnippet()));
        }

        foreach ($parts as $part) {
            if ($part->getMimeType() === 'text/html') {
                $data = $part->getBody()->getData();
                return $this->base64UrlDecode($data);
            }
        }

        return nl2br(htmlspecialchars($message->getSnippet()));
    }

    private function base64UrlDecode($data)
    {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }

    private function getHeader($headers, $name)
    {
        foreach ($headers as $header) {
            if ($header->getName() === $name) {
                return $header->getValue();
            }
        }
        return '';
    }

    private function extractName($fromHeader)
    {
        if (preg_match('/"([^"]+)"/', $fromHeader, $matches)) {
            return $matches[1];
        }

        if (preg_match('/([^<]+)</', $fromHeader, $matches)) {
            return trim($matches[1]);
        }

        return $fromHeader;
    }

    private function getPageToken($page)
    {
        // implementation for pagination tokens
        return null;
    }

    private function formatMessage($messageId)
    {
        try {
            $message = $this->service->users_messages->get('me', $messageId, ['format' => 'metadata']);
            $payload = $message->getPayload();
            $headers = $payload->getHeaders();

            return [
                'id' => $messageId,
                'subject' => $this->getHeader($headers, 'Subject') ?: 'No subject',
                'from_email' => $this->getHeader($headers, 'From') ?: 'No sender',
                'from_name' => $this->extractName($this->getHeader($headers, 'From')) ?: 'Unknown Sender',
                'date' => $this->getHeader($headers, 'Date') ?: now()->toDateTimeString(),
                'snippet' => $message->getSnippet() ?: 'No preview available',
                'is_read' => !in_array('UNREAD', $message->getLabelIds())
            ];
        } catch (\Exception $e) {
            return [
                'id' => $messageId,
                'subject' => 'Error loading subject',
                'from_email' => 'Error',
                'from_name' => 'Error',
                'date' => now()->toDateTimeString(),
                'snippet' => 'Failed to load message',
                'is_read' => true,
                'error' => $e->getMessage()
            ];
        }
    }
}
