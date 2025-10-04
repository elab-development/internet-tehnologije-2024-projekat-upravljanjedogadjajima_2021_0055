<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'user_id', 'category_id', 'starts_at'];

    protected $cast = [
        'starts_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);  // Dogadjaj pripada korisniku
    }

    public function category()
    {
        return $this->belongsTo(Category::class);  // Dogadjaj pripada kategoriji
    }
}
