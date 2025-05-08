<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\UserCompany;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Validate general query parameters first
        $request->validate([
            'page' => 'sometimes|integer|min:1',
            'itemsPerPage' => 'required|integer|min:-1|max:100|not_in:0',
            'q' => 'nullable|string',
            'role' => 'nullable|string|max:50',
        ]);

        $page = $request->integer('page', 1);
        $itemsPerPage = $request->integer('itemsPerPage', 10);
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
                'status' => 'active',
                'currentPlan' => 'basic',
                'avatar' => null,
                'user' => [
                    'fullName' => $user->name,
                    'email' => $user->email,
                    'company' => $user->companies->first()?->company_name ?? 'N/A',
                    'role' => $user->roles->first()?->name ?? 'N/A',
                ],
            ];
        };

        // Get all unique role names for the filter dropdown
        $allRoles = Role::distinct()->pluck('name')->toArray();

        // Decide whether to paginate or get all results
        if ($itemsPerPage === -1) {
            $users = $query->get();
            $totalUsers = $users->count();
            $transformedUsers = $users->map($transformUser);

            $response = [
                'data' => $transformedUsers->toArray(),
                'total' => $totalUsers,
                'current_page' => 1,
                'per_page' => $totalUsers,
                'last_page' => 1,
                'from' => $totalUsers > 0 ? 1 : 0,
                'to' => $totalUsers,
                'all_roles' => $allRoles,
            ];
        } else {
            $paginatedUsers = $query->paginate($itemsPerPage, ['*'], 'page', $page);
            $transformedUsers = $paginatedUsers->getCollection()->map($transformUser);

            $response = $paginatedUsers->toArray();
            $response['data'] = $transformedUsers->toArray();
            $response['all_roles'] = $allRoles;
        }

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

            // Assign company relationship
            $user->companies()->attach($validated['company_id']);
            \Log::info('Company assigned to user.', ['user_id' => $user->id, 'company_id' => $validated['company_id']]);

            // Assign role relationship
            $user->roles()->attach($validated['role_id']);
            \Log::info('Role assigned to user.', ['user_id' => $user->id, 'role_id' => $validated['role_id']]);

            \DB::commit();

            return response()->json(['message' => 'User created successfully.', 'user' => $user], 201);
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
            'role' => $user->roles->first()?->name ?? 'N/A',
            'companies' => $user->companies->map(function($company) {
                return [
                    'id' => $company->id,
                    'company_name' => $company->company_name
                ];
            }),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at
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
        ]);

        $user = User::findOrFail($id);

        // Update user fields
        $user->update([
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
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
}
