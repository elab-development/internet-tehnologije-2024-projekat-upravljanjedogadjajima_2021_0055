// Koristimo jednostavan helper za praznike
export async function HolidaysRS(year) {
    const response = await fetch(`/api/holidays/${year}/RS`);
    if (!response.ok) {
        throw new Error('Ne mogu da učitam javne praznike.');
    }
    return response.json();
}