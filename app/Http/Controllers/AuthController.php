<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Role;
use Validator;

class AuthController extends Controller
{
  /**
  * Create user
  *
  * @param  [string] name
  * @param  [string] email
  * @param  [string] password
  * @param  [string] password_confirmation
  * @return [string] message
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
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password)
        ]);

        if ($user->save()) {
            \Log::info('User saved successfully.', ['user_id' => $user->id]);

            // Assign the 'User' role
            $defaultRole = Role::where('name', 'User')->first();
            if ($defaultRole) {
                \Log::info('Default role found.', ['role_id' => $defaultRole->id]);

                $user->roles()->attach($defaultRole->id);

                \Log::info('Role assigned to user.', [
                    'user_id' => $user->id,
                    'role_id' => $defaultRole->id
                ]);
            } else {
                \Log::warning('Default role not found.');
            }

            return response()->json([
                'message' => 'Successfully created user with user role!'
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
  * Login user and create token
  *
  * @param  [string] email
  * @param  [string] password
  * @param  [boolean] remember_me
  * @return [string] access_token
  * @return [string] token_type
  * @return [string] expires_at
  */
  public function login(Request $request)
{
    try {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember_me' => 'boolean'
        ]);

        $credentials = $request->only('email', 'password');
        
        \Log::info('Login credentials:', $credentials);
        \Log::info('Auth attempt result:', ['success' => Auth::attempt($credentials)]);
        if (!Auth::attempt($credentials)) {
            \Log::warning('Failed login attempt for email: ' . $credentials['email']);
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = Auth::user();

        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->accessToken;

        if ($request->remember_me) {
            $tokenResult->token->expires_at = Carbon::now()->addWeeks(1);
            $tokenResult->token->save();
        }

        // Fetch user permissions and roles
        $userPermissions = $user->permissions->map(function ($permission) {
            return [
                'action' => $permission->action,
                'subject' => $permission->subject,
            ];
        });

         // If the user has no permissions, return an error
         if ($userPermissions->isEmpty()) {
            return response()->json(['message' => 'User does not have sufficient permissions.'], 403);
        }

        $userRole = $user->roles->first()->name ?? 'client';

        // Prepare the response data
        $userData = [
            'id'            => $user->id,
            'fullName'      => $user->name,
            'username'      => $user->username ?? $user->email,
            'email'         => $user->email,
            'role'          => strtolower($userRole),
            'abilityRules'  => $userPermissions->toArray(),
        ];

        $response = response()->json([
            'accessToken' => $token,
            'userData' => $userData,
            'abilityRules' => $userPermissions,
            'expires_at' => Carbon::parse($tokenResult->token->expires_at)->toDateTimeString(),
        ]);

        // Set cookies with the response
        return $response
            ->cookie('accessToken', $token, 60 * 24 * 7) // 7 days
            ->cookie('userData', json_encode($userData), 60 * 24 * 7)
            ->cookie('userAbilityRules', json_encode($userPermissions), 60 * 24 * 7)
            ->withHeaders([
                'Access-Control-Allow-Credentials' => 'true',
                'Access-Control-Allow-Origin' => config('app.url'),
            ]);
    } catch (\Exception $e) {
        \Log::error("Login error: " . $e->getMessage());
        return response()->json(['message' => 'An error occurred. Please try again.'], 500);
    }
}


    /**
  * Get the authenticated User
  *
  * @return [json] user object
  */
  public function user(Request $request)
  {
    return response()->json($request->user());
  }

    /**
  * Logout user (Revoke the token)
  *
  * @return [string] message
  */
  public function logout(Request $request)
  {
    $request->user()->token()->revoke();
    return response()->json([
      'message' => 'Successfully logged out'
    ]);
  }
}
