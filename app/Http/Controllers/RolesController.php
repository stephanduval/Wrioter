<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RolesController extends Controller
{
    public function index()
    {
        \Log::info('RolesController index method accessed');

        // Fetch roles sorted alphabetically by name
        $roles = Role::query()
            ->orderBy('name', 'asc')
            ->get();

        // Transform roles data
        $transformedRoles = $roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
            ];
        });

        return response()->json($transformedRoles, 200, ['Content-Type' => 'application/json']);
    }
}
