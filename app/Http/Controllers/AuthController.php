<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\User;
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
      $request->validate([
          'name' => 'required|string',
          'email' => 'required|string|email|unique:users',
          'password' => 'required|string',
          'c_password' => 'required|same:password',
      ]);
  
      $user = new User([
          'name' => $request->name,
          'email' => $request->email,
          'password' => bcrypt($request->password)
      ]);
  
      if ($user->save()) {
          // Assign 'user' role to the new user
          $userRole = \App\Models\Role::where('name', 'user')->first();
          
          if ($userRole) {
              $user->roles()->attach($userRole->id);
          }
  
          return response()->json([
              'message' => 'Successfully created user with user role!'
          ], 201);
      } else {
          return response()->json(['error' => 'Provide proper details'], 400);
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
        
        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = Auth::user();

        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->accessToken;

        if ($request->remember_me) {
            $tokenResult->token->expires_at = Carbon::now()->addWeeks(1);
            $tokenResult->token->save();
        }

        // Get user's roles with permissions and actions
        $roles = $user->roles()->with(['permissions' => function($query) {
            $query->select('permissions.*', 'permission_role.action_id')
                  ->join('actions', 'actions.id', '=', 'permission_role.action_id');
        }])->get();

        // Format permissions with actions
        $abilityRules = [];
        foreach ($roles as $role) {
            foreach ($role->permissions as $permission) {
                $abilityRules[] = [
                    'action' => $permission->action,
                    'subject' => $permission->subject,
                    'action_id' => $permission->pivot->action_id
                ];
            }
        }

        // If the user has no permissions, return an error
        if (empty($abilityRules)) {
            return response()->json(['message' => 'User does not have sufficient permissions.'], 403);
        }

        $userRole = $roles->first()->name ?? 'client';

        // Prepare the response data
        $userData = [
            'id' => $user->id,
            'fullName' => $user->name,
            'username' => $user->username ?? $user->email,
            'email' => $user->email,
            'role' => strtolower($userRole),
            'abilityRules' => $abilityRules,
        ];

        return response()->json([
            'accessToken' => $token,
            'userData' => $userData,
            'abilityRules' => $abilityRules,
            'expires_at' => Carbon::parse($tokenResult->token->expires_at)->toDateTimeString(),
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
