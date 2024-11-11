<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Permission;

class AddManagePermissionToPermissionsTable extends Migration
{
    public function up()
    {
        Permission::create(['action' => 'manage', 'subject' => 'all']); // Adjust the subject as needed
    }

    public function down()
    {
        Permission::where('action', 'manage')->delete();
    }
};
