<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Role;

class AuthController extends Controller
{
    /**
     * Create user (Registration)
     */
    public function register(Request $request)
    {
        try {
            \Log::info('Incoming registration request:', $request->all());

            // Validate input
            $request->validate([
                'name' => 'required|string',
                'email' => 'required|string|email|unique:users',
                'password' => 'required|string',
                'c_password' => 'required|same:password',
            ]);

            \Log::info('Validation successful.');

            // Create the user
            $user = new User([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => bcrypt($request->password),
            ]);

            if ($user->save()) {
                \Log::info('User saved successfully.', ['user_id' => $user->id]);

                // Optionally assign a default role named 'Client'
                $defaultRole = Role::where('name', 'Client')->first();
                if ($defaultRole) {
                    \Log::info('Client role found.', ['role_id' => $defaultRole->id]);
                    $user->roles()->attach($defaultRole->id);
                    \Log::info('Role assigned to user.', [
                        'user_id' => $user->id,
                        'role_id' => $defaultRole->id
                    ]);
                } else {
                    \Log::warning('Client role not found.');
                }

                return response()->json([
                    'message' => 'Successfully created user with Client role!'
                ], 201);
            } else {
                \Log::error('Failed to save user.', $user->toArray());
                return response()->json(['error' => 'Unable to save user.'], 500);
            }
        } catch (\Exception $e) {
            \Log::error('Registration error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'An error occurred. Please try again.'], 500);
        }
    }

    /**
     * Login user and create a Sanctum token
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email'      => 'required|string|email',
                'password'   => 'required|string',
                'remember_me'=> 'boolean'
            ]);

            $credentials = $request->only('email', 'password');
            \Log::info('Login attempt:', $credentials);

            if (!Auth::attempt($credentials)) {
                \Log::warning('Unauthorized login attempt for email: ' . $credentials['email']);
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $user = Auth::user();
            \Log::info('User authenticated:', ['user_id' => $user->id]);

            // Generate Sanctum token
            try {
                $plainTextToken = $user->createToken('API Token')->plainTextToken;
            } catch (\Exception $e) {
                \Log::error('Token creation failed:', [
                    'user_id' => $user->id,
                    'error'   => $e->getMessage(),
                ]);
                return response()->json([
                    'message' => 'Unable to generate token. Please contact support.'
                ], 500);
            }

            // For "remember me" you no longer do $token->expires_at with Sanctum by default
            // If you want to keep track, you can store it manually somewhere or skip it

            // Fetch permissions if your User model has a "permissions" attribute
            $userPermissions = $user->permissions ?? collect();
            if ($userPermissions->isEmpty()) {
                \Log::warning('User has no permissions.', ['user_id' => $user->id]);
                return response()->json(['message' => 'User does not have sufficient permissions.'], 403);
            }

            \Log::info('User permissions:', [
                'user_id' => $user->id,
                'permissions' => $userPermissions->toArray(),
            ]);

            // Fetch user role
            $userRole = $user->roles->first()->name ?? null;
            if (!$userRole) {
                \Log::error('User has no role assigned.', ['user_id' => $user->id]);
                return response()->json(['message' => 'User does not have a valid role.'], 403);
            }

            // Prepare response data
            $userData = [
                'id'           => $user->id,
                'fullName'     => $user->name,
                'username'     => $user->username ?? $user->email,
                'email'        => $user->email,
                'role'         => strtolower($userRole),
                'abilityRules' => $userPermissions->toArray(),
            ];

            // Return as JSON
            return response()->json([
                'accessToken'   => $plainTextToken,  // This is what the Vue front end will store
                'userData'      => $userData,
                'abilityRules'  => $userPermissions,
            ]);

            // If you want to set a cookie for the token, you could do so:
            // ->cookie('accessToken', $plainTextToken, 60 * 24 * 7, ...)
            // but for a token-based approach, you typically just store it in localStorage on the frontend

        } catch (\Exception $e) {
            \Log::error('Login error:', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'An error occurred. Please try again.'], 500);
        }
    }

    /**
     * Return the authenticated user
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Logout user (Revoke current token)
     */
    public function logout(Request $request)
    {
        \Log::info('Authorization Header:', [$request->header('Authorization')]);
        \Log::info('Bearer Token:', [$request->bearerToken()]);

        // Sanctum method to delete the currently used token:
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Successfully logged out'], 200);
        }

        return response()->json(['message' => 'Unable to log out.'], 401);
    }

    /**
     * Handle unauthenticated attempts
     */
    protected function unauthenticated($request, array $guards)
    {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}
