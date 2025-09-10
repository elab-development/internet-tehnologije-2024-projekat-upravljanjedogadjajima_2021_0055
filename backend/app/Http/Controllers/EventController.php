<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;

class EventController extends Controller
{
    // Prikazivanje svih događaja
    public function index(Request $request)
    {
        $request->validate([
        'page'        => 'sometimes|integer|min:1',
        'per_page'    => 'sometimes|integer|min:1|max:100',
        'from'        => 'sometimes|date',
        'to'          => 'sometimes|date',
        'category_id' => 'sometimes|exists:categories,id',
        'q'           => 'sometimes|string', // pretraga
        ]);

        $q = \App\Models\Event::with(['user','category'])
                                ->whereNotNull('starts_at')
                                ->orderBy('starts_at');

        if ($request->filled('from')) $q->where('starts_at', '>=', $request->from);
        if ($request->filled('to'))   $q->where('starts_at', '<=', $request->to);
        if ($request->filled('category_id')) $q->where('category_id', $request->category_id);

        if ($request->filled('q')) {
            $term = $request->q;
            $q->where(function ($qq) use ($term) {
                $qq->where('name', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        $perPage = $request->integer('per_page', 10);
        return response()->json($q->paginate($perPage), 200);
    }

    // Kreiranje novog događaja
    public function store(Request $request)
    {
        // user_id se ne prima iz body-a
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'starts_at'   => 'required|date',
        ]);

        $event = Event::create([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'starts_at'   => $validated['starts_at'],
            'user_id'     => $request->user()->id, // ← iz tokena
        ]);

        return response()->json($event, 201);
    }

    // Prikazivanje jednog događaja
    public function show($id)
    {
        return response()->json($event, 200);
    }

    // Ažuriranje događaja
    public function update(Request $request, $id)
    {
        // Dozvoli izmenu samo vlasniku
        if ($request->user()->id !== $event->user_id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'starts_at'   => 'sometimes|required|date',
        ]);

        // Ažuriramo SAMO dozvoljena polja
        $event->update($validated);

        return response()->json($event, 200);
    }

    // Brisanje događaja
    public function destroy($id)
    {
        if ($request->user()->id !== $event->user_id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $event->delete();

        return response()->json(['message' => 'Event deleted successfully'], 200);
    }
}
