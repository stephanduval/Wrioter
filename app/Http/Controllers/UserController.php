<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
{
    $users = User::query()
        ->when($request->get('q'), function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        })
        ->paginate($request->get('itemsPerPage', 10));

    // Transform users data
    $transformedUsers = $users->getCollection()->map(function ($user) {
        return [
            'id' => $user->id,
            'fullName' => $user->name,
            'email' => $user->email,
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

    // Replace the collection with the transformed data
    $paginatedResponse = $users->toArray();
    $paginatedResponse['data'] = $transformedUsers;

    return response()->json($paginatedResponse);
}
}
