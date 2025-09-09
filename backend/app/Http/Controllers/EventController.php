<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;

class EventController extends Controller
{
    // Prikazivanje svih događaja
    public function index()
    {
        $events = Event::with(['user', 'category'])->orderBy('starts_at')->get();
        return response()->json($events, 200);
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
