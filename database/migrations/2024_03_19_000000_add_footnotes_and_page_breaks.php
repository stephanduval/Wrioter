<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create the writing_notes table for footnotes and endnotes
        Schema::create('writing_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->enum('type', ['footnote', 'endnote'])->default('footnote');
            $table->json('marker_position')->comment('Position in the document (e.g., line number, character position)');
            $table->text('content');
            $table->string('marker_text', 50)->nullable()->comment('Custom marker text if different from auto-numbered');
            $table->integer('order')->default(0)->comment('Order within the document');
            $table->json('metadata')->nullable()->comment('Additional note metadata (style, formatting, etc.)');
            $table->boolean('is_resolved')->default(false)->comment('For tracking if a note has been addressed');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better query performance
            $table->index(['item_id', 'type']);
            $table->index(['item_id', 'order']);
            $table->index('is_resolved');
        });

        // Add page break control columns to writing_compiled_output_items
        Schema::table('writing_compiled_output_items', function (Blueprint $table) {
            $table->boolean('page_break_before')->default(false)->after('order')
                ->comment('Force a page break before this item');
            $table->boolean('page_break_after')->default(false)->after('page_break_before')
                ->comment('Force a page break after this item');
            $table->string('page_number_style', 50)->nullable()->after('page_break_after')
                ->comment('Style for page numbers (e.g., roman, arabic, none)');
            $table->boolean('start_new_section')->default(false)->after('page_number_style')
                ->comment('Start a new section (affects headers/footers)');
            $table->string('section_style', 50)->nullable()->after('start_new_section')
                ->comment('Style for the new section (e.g., first-page, even-odd)');
            $table->json('page_settings')->nullable()->after('section_style')
                ->comment('Additional page settings (margins, orientation, etc.)');
        });

        // Create a table for note references (to track where notes are referenced in the text)
        Schema::create('writing_note_references', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained('writing_notes')->onDelete('cascade');
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->json('reference_position')->comment('Position where the note is referenced');
            $table->string('reference_text', 255)->nullable()->comment('The actual text that references the note');
            $table->timestamps();

            // Indexes
            $table->index(['note_id', 'item_id']);
            $table->index('reference_position', 'writing_note_references_position_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_note_references');
        
        Schema::table('writing_compiled_output_items', function (Blueprint $table) {
            $table->dropColumn([
                'page_break_before',
                'page_break_after',
                'page_number_style',
                'start_new_section',
                'section_style',
                'page_settings'
            ]);
        });

        Schema::dropIfExists('writing_notes');
    }
}; 
