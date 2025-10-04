# Aurora Backend

## Funkcionalnosti
- Registracija / Prijava / Odjava
- Uloge: Admin / User
- Events: CRUD, paginacija, filtriranje (from, to, category_id, user_id, q), sortiranje po starts_at
- Categories: javno čitanje, CRUD za autentifikovane
- Users: javno čitanje (liste/detalj), CRUD za admina (korisnik može menjati samo sebe)
- JSON odgovori i JSON greške

## Pokretanje aplikacije na racunaru
### Preduslovi
- Php 8.1+
- Composer
- MySql (Xampp)
### Instalacija
- git clone <URL REPOZITORIJUMA SA GIT HUB-A>
- cd backend
- cp .env.example .env

### Podesavanje baze u .env
- DB_CONNECTION=mysql
- DB_HOST=127.0.0.1
- DB_PORT=3306
- DB_DATABASE=upravljanjedogadjajima
- DB_USERNAME=root
- DB_PASSWORD=

### Instaliranje zavisnosti i generisi kljuc
- composer install
- php artisan key:generate

### Migracije i seed
- php artisan migrate
- php artisan db:seed (opciono punjenje baze podataka)

### Pokretanje servera
- php artisan serve

# License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
