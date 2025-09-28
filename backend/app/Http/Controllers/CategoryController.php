<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Category;

class CategoryController extends Controller
{
    // Prikazivanje svih kategorija
    public function index()
    {
        $categories = Category::all();
        return response()->json($categories, 200);
    }

    // Kreiranje nove kategorije
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
        ]);

        $category = Category::create([
            'name' => $validated['name'],
        ]);

        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        return response()->json($category, 200);
    }

    // Ažuriranje kategorije
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('categories', 'name')->ignore($category->id),
            ],
        ]);

        $category->update($validated);

        return response()->json($category, 200);
    }

    // Brisanje kategorije
    public function destroy(Request $request, Category $category)
    {   
        $auth = $request->user();
        if($auth->role !== 'admin') {
            return response()->json([
                'error' => 'Only admins can delete categories!'
            ], 403);
        }

        if($category->events()->exists()) {
            return response()->json([
                'error' => 'Cannot delete category with existing events!'
            ], 409);
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted successfully.'], 200);
    }
}
