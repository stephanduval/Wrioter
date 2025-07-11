<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\UserCompany;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Password;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Validate general query parameters first
        $request->validate([
            'page' => 'sometimes|integer|min:1',
            'itemsPerPage' => 'required|string|in:all,10,25,50,100',
            'q' => 'nullable|string',
            'role' => 'nullable|string|max:50',
        ]);

        $page = $request->integer('page', 1);
        $itemsPerPage = $request->input('itemsPerPage', '10');
        $searchQuery = $request->input('q');
        $filterRole = $request->input('role');

        \Log::info('User List Request Parameters:', [
            'page' => $page,
            'itemsPerPage' => $itemsPerPage,
            'q' => $searchQuery,
            'role' => $filterRole,
        ]);

        // Eager load companies and roles to optimize queries
        $query = User::with(['companies', 'roles'])
            ->when($searchQuery, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('users.name', 'like', "%{$search}%")
                      ->orWhere('users.email', 'like', "%{$search}%");
                });
            })
            ->when($filterRole, function ($query, $roleName) {
                $query->whereHas('roles', function ($q) use ($roleName) {
                    $q->where('name', $roleName);
                });
            });

        // Define the transformation closure to reuse it
        $transformUser = function ($user) {
            return [
                'id' => $user->id,
                'fullName' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name ?? 'N/A',
                'company' => $user->companies->first()?->company_name ?? 'N/A',
                'department' => $user->department ?? 'N/A',
                'status' => 'active',
                'currentPlan' => 'basic',
                'avatar' => null,
                'user' => [
                    'fullName' => $user->name,
                    'email' => $user->email,
                    'company' => $user->companies->first()?->company_name ?? 'N/A',
                    'role' => $user->roles->first()?->name ?? 'N/A',
                    'department' => $user->department ?? 'N/A',
                ],
            ];
        };

        // Get all unique role names for the filter dropdown
        $allRoles = Role::distinct()->pluck('name')->toArray();

        // Handle 'all' items per page
        if ($itemsPerPage === 'all') {
            $users = $query->get();
            $totalUsers = $users->count();
            $transformedUsers = $users->map($transformUser);

            return response()->json([
                'data' => $transformedUsers->toArray(),
                'total' => $totalUsers,
                'current_page' => 1,
                'per_page' => $totalUsers,
                'last_page' => 1,
                'from' => $totalUsers > 0 ? 1 : 0,
                'to' => $totalUsers,
                'all_roles' => $allRoles,
            ]);
        }

        // Handle paginated results
        $paginatedUsers = $query->paginate((int) $itemsPerPage, ['*'], 'page', $page);
        $transformedUsers = $paginatedUsers->getCollection()->map($transformUser);

        $response = $paginatedUsers->toArray();
        $response['data'] = $transformedUsers->toArray();
        $response['all_roles'] = $allRoles;

        return response()->json($response);
    }

    public function addUser(Request $request)
    {
        \Log::info('Add User Request: ', $request->all());

        // Validate the request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:8',
            'company_id' => 'required|exists:companies,id',
            'role_id' => 'required|exists:roles,id',
            'department' => 'nullable|string|max:255',
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
                'department' => $validated['department'] ?? null,
            ]);

            \Log::info('User created: ', ['id' => $user->id]);

            // Assign company relationship
            $user->companies()->attach($validated['company_id']);
            \Log::info('Company assigned to user.', ['user_id' => $user->id, 'company_id' => $validated['company_id']]);

            // Assign role relationship
            $user->roles()->attach($validated['role_id']);
            \Log::info('Role assigned to user.', ['user_id' => $user->id, 'role_id' => $validated['role_id']]);

            // Generate reset code for the new user
            $resetCode = Str::random(12);
            \Log::info('Generated reset code for new user', [
                'user_id' => $user->id,
                'email' => $user->email,
                'reset_code' => $resetCode, // Log the actual reset code
            ]);

            $tokenInserted = DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($resetCode),
                    'created_at' => now(),
                ]
            );

            \Log::info('Reset token stored in database', [
                'user_id' => $user->id,
                'email' => $user->email,
                'token_inserted' => $tokenInserted,
            ]);

            \DB::commit();

            $response = [
                'message' => 'User created successfully.',
                'user' => $user,
                'reset_code' => $resetCode,
            ];

            \Log::info('Sending response for new user creation', [
                'user_id' => $user->id,
                'has_reset_code' => !empty($resetCode),
                'response_keys' => array_keys($response),
            ]);

            return response()->json($response, 201);
        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Error Adding User: ', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Failed to create user.', 'details' => $e->getMessage()], 500);
        }
    }

    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);

            \DB::transaction(function () use ($user) {
                $user->delete();
            });

            return response()->json(['message' => 'User deleted successfully.'], 200);
        } catch (\Exception $e) {
            \Log::error('Error deleting user: ', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to delete user.'], 500);
        }
    }

    public function showUser($id)
    {
        try {
            $user = User::with(['companies', 'roles'])->findOrFail($id);

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'department' => $user->department,
                'company_id' => $user->companies->first()?->id, // Assuming one company per user
                'role_id' => $user->roles->first()?->id, // Assuming one role per user
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching user details: ', ['message' => $e->getMessage()]);

            return response()->json(['error' => 'User not found.'], 404);
        }
    }

    public function updateUser(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|string|email|unique:users,email,' . $id,
                'company_id' => 'sometimes|required|exists:companies,id',
                'role_id' => 'sometimes|required|exists:roles,id',
                'department' => 'nullable|string|max:255',
            ]);

            $user = User::findOrFail($id);

            // Update user fields
            $user->update([
                'name' => $validated['name'] ?? $user->name,
                'email' => $validated['email'] ?? $user->email,
                'department' => $validated['department'] ?? $user->department,
            ]);

            // Update company relationship
            if (isset($validated['company_id'])) {
                $user->companies()->sync([$validated['company_id']]);
            }

            // Update role relationship
            if (isset($validated['role_id'])) {
                $user->roles()->sync([$validated['role_id']]);
            }

            return response()->json(['message' => 'User updated successfully.', 'user' => $user]);
        } catch (\Exception $e) {
            \Log::error('Error updating user: ', ['message' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to update user.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Generate a reset code for a user
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateResetCode($id)
    {
        try {
            $user = User::findOrFail($id);

            // Generate a secure random code
            $resetCode = Str::random(12);

            // Store the reset code in the password_reset_tokens table
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($resetCode),
                    'created_at' => now(),
                ]
            );

            // Log the reset code generation
            \Log::info('Reset code generated for user', [
                'user_id' => $user->id,
                'email' => $user->email,
                'generated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Reset code generated successfully',
                'reset_code' => $resetCode,
                'expires_at' => now()->addMinutes(60)->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error generating reset code:', [
                'user_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to generate reset code',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
