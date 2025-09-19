<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting database seeding...');

        $this->call([
            // Core system seeders
            RolePermissionActionSubjectSeeder::class,
            CompanySeeder::class,
            UserSeeder::class,

            // Manuscript organization seeders
            ManuscriptGroupSeeder::class,
            ManuscriptSeeder::class,

            // Content seeders (items must be created before linking to manuscripts)
            ComprehensiveItemSeeder::class,

            // Relationship seeders (link items to manuscripts with metadata)
            ManuscriptItemSeeder::class,

            // Collection seeders (create collections and link items to them)
            ManuscriptCollectionSeeder::class,

            // Note: ItemSeeder is replaced by ComprehensiveItemSeeder
            // which provides much richer hierarchical content
        ]);

        $this->command->info('✅ Database seeding completed successfully!');
        $this->command->info('📚 Created rich manuscript structures with:');
        $this->command->info('   • 5 diverse manuscripts across different genres');
        $this->command->info('   • 4 manuscript groups for organization');
        $this->command->info('   • Hierarchical folder structures with parent-child relationships');
        $this->command->info('   • Multiple item types: text, folders, mindmaps, research, links');
        $this->command->info('   • Collections for organizing content across manuscripts');
        $this->command->info('   • Realistic word counts, metadata, and status indicators');
        $this->command->info('   • Item versions with comprehensive metadata');
        $this->command->info('🎯 Perfect for testing the dynamic manuscript navigation UI!');
    }
}
