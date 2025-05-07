<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Project;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can delete the project.
     */
    public function delete(User $user, Project $project)
    {
        // Only admin can delete projects
        return $user->roles()->where('name', 'admin')->exists();
    }

    /**
     * Determine whether the user can view the project.
     */
    public function view(User $user, Project $project)
    {
        return $user->roles()->where('name', 'admin')->exists() || 
               $user->id === $project->client_id;
    }

    /**
     * Determine whether the user can update the project.
     */
    public function update(User $user, Project $project)
    {
        return $user->roles()->where('name', 'admin')->exists() || 
               $user->id === $project->client_id;
    }
} 
