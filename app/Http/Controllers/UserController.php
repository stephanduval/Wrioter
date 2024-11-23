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

public function addUser(Request $request)
{
    \Log::info('Add User Request: ', $request->all());

    // Validate the request
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|unique:users,email',
        'password' => 'required|string|min:8',
        'company_id' => 'required|exists:companies,id',
        'role_id' => 'required|exists:roles,id',
    ]);
    
    \Log::info('Validated Data: ', $validated);


    try {
        \DB::beginTransaction();

        // Create the user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'password_reset_required' => true,
        ]);

        

        \Log::info('User created: ', ['id' => $user->id]);

        // Create relationships
        UserCompany::create([
            'user_id' => $user->id,
            'company_id' => $validated['company_id'],
        ]);

        \Log::info('UserCompany created.');


        UserRole::create([
            'user_id' => $user->id,
            'role_id' => $validated['role_id'],
        ]);

        \Log::info('UserRole created.');


        \DB::commit();

        return response()->json(['message' => 'User created successfully.', 'user' => $user], 201);
    } catch (\Exception $e) {
        \DB::rollBack();
        \Log::error('Error Adding User: ', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Failed to create user.', 'details' => $e->getMessage()], 500);
    }
}




}
