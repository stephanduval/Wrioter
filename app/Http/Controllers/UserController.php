<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Fetch users with pagination
        $users = User::query()
            ->when($request->get('q'), function($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->paginate($request->get('itemsPerPage', 10));

        // Transform the data to match frontend expectations
        $transformedUsers = collect($users->items())->map(function($user) {
            return [
                'id' => $user->id,
                'fullName' => $user->name,
                'email' => $user->email,
                // Add virtual fields that frontend expects
                'role' => 'user',
                'status' => 'active',
                'currentPlan' => 'basic',
                'avatar' => null,
                'billing' => 'auto',
                'user' => [
                    'fullName' => $user->name,
                    'email' => $user->email,
                ]
            ];
        });

        return response()->json($users);

    }
}
