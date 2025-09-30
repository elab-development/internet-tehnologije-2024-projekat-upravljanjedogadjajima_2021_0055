<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class HolidaysController extends Controller
{
    public function rs($year)
    {
        $year = (int) $year;
        if ($year < 1990 || $year > 2100) {
            return response()->json(['message' => 'Invalid year'], 422);
        }

        // Kesiramo podatke na 7 dana
        $cacheKey = "holidays_rs_{$year}";
        $data = Cache::remember($cacheKey, now()->addDays(7), function () use ($year) {
            $resp = Http::timeout(6)->get("https://date.nager.at/api/v3/PublicHolidays/{$year}/RS");
            if ($resp->failed()) {
                return null;
            }
            return $resp->json();
        });

        if ($data === null) {
            return response()->json(['message' => 'Upstream holidays API failed'], 502);
        }

        return response()->json($data, 200);
    }
}
