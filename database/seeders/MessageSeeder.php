<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Message;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Faker\Factory as Faker;

class MessageSeeder extends Seeder
{
    public function run()
    {
        DB::table('messages')->delete(); // ✅ Avoid truncation issue

        $faker = Faker::create();

        $messages = [];

        for ($i = 0; $i < 5; $i++) {
            $messages[] = [
                'sender_id' => $faker->numberBetween(1, 5), // ✅ Random sender ID (adjust as needed)
                'company_id' => $faker->numberBetween(1, 3), // ✅ Random company ID
                'subject' => $faker->sentence(6, true), // ✅ Random subject
                'body' => '<p>' . $faker->paragraph(3, true) . '</p>', // ✅ Random email body
                'status' => $faker->randomElement(['draft', 'deleted', 'archived', 'inbox']), // ✅ Random status
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        foreach ($messages as $messageData) {
            $message = Message::create($messageData);
            Log::info('Seeded message:', ['message' => $message]);
        }
    }
}
