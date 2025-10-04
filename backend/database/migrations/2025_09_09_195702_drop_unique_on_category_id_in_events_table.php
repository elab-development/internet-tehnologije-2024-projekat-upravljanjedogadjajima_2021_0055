<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign('events_category_id_foreign');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropUnique('events_category_id_unique');
            $table->index('category_id'); // non-unique index
        });

        // vracamo foreign key constraint
        Schema::table('events', function (Blueprint $table) {
            $table->foreign('category_id')
                  ->references('id')->on('categories')
                  ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex(['category_id']);
            $table->unique('category_id');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->foreign('category_id')
                  ->references('id')->on('categories')
                  ->cascadeOnDelete();
        });
    }
};
