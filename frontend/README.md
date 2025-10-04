# Aurora Frontend

## Funkcionalnosti
- Sidebar: lista korisnika, klik menja kontekst dogadjaja u srednjoj koloni.
- Dogadjaji(srednja kolona):
    - lista kartica sa imenom formatiranim vremenom
    - ucitaj jos(paginacija) preko custom hook-a 
    - + dodaj (samo kada gledamo svoje dogadjaje)
    - Edit/Delete sa permisijama
- Detalji dogadjaja: ime, vreme, kategorija, opis
- Kategorije: Svi mogu da vide i svi mogu da dodaju kategorije sem gosta.
- Export CSV: Dugme u hederu Dashboarda

## Pokretanje aplikacije na racunaru
### Preduslovi
- Node.js 18+
- npm
- Pokrenut Laravel API

### Instalacije
- git clone <URL REPOZITORIJUMA SA GIT HUB-A>
- cd frontend

### Instalacija zavisnosti
- npm install
- cp .env.example .env

### Pokretanje
- npm run dev