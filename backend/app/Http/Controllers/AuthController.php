<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    // Registracija korisnika
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        // Validacija ulaza
        $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
        ]);

        // Pokusaj autentifikacije
        if (!Auth::attempt($credentials)) {
        return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Uzima ulogovanog korisnika i kreiraj token
        $user  = Auth::user();
        $token = $user->createToken('api_token')->plainTextToken;

        // Vraca JSON
        return response()->json([
        'user'  => $user,
        'token' => $token
        ], 200);
    }

    public function logout(Request $request)
    {
        // Brise sve aktivne tokene korisnika
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
