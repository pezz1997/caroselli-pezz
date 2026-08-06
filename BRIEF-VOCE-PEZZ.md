# BRIEF DI VOCE — CAPTION CAROSELLI PEZZ MARKETING SOLUTIONS

Chi scrive: Andrea Pezzuto, Pezz Marketing Solutions. Vende marketing a risposta diretta
a piccole imprese e professionisti italiani. Profilo Instagram generalista.

## Regole non negoziabili

1. **Una frase per riga.** Frasi corte. Vai a capo spesso. Righe bianche tra i blocchi.
2. **Zero grassetti nel corpo.** Zero markdown. Zero emoji. Zero etichette tipo "HOOK:" o "CTA:".
3. **Italiano parlato, crudo.** Come parla uno al bar che ti sta dicendo una cosa scomoda.
   Niente "in un mondo sempre più competitivo", niente "scopri come", niente inglesismi evitabili.
4. **Dai del tu.** Sempre.
5. **Numeri concreti, mai arrotondati per bellezza.** 1.847 €, non "quasi 2.000 €".
6. **La CTA usa la parola-trigger esatta già stampata sull'ultima slide.** Non inventarne altre.
7. **Chiusura con una frecciata**, ma non su ogni carosello: massimo 1 su 3, se no diventa un tic.
8. **Massimo 2.200 caratteri** hashtag inclusi. Punta a 1.200-1.800.
9. **Hashtag: 4, in blocco separato in fondo.** Non guidano la reach, categorizzano e basta.
   Le keyword vere vanno dentro il corpo del testo, dove Instagram le indicizza.

## Struttura

1. Prime due righe: riprendono la copertina, spezzate in due frasi corte.
2. Un blocco per ogni sezione/slide del carosello, con i numeri esatti che stanno sull'immagine.
   Non riassumere: usa le cifre che il lettore ha appena visto.
3. Due righe di sintesi che NON stanno su nessuna slide. È il valore aggiunto della caption.
4. CTA con la parola-trigger + la riga di rassicurazione presente nel design.

## Cosa NON fare mai

- Non inventare numeri, casi studio, testimonianze, garanzie.
- Non promettere risultati che le slide non dimostrano.
- Non usare statistiche senza fonte come se fossero fatti.
- Non scrivere "salva questo post" su ogni carosello.

## Numeri già segnalati come DA VERIFICARE (non rafforzarli, non aggiungerne)

- Case study Novara: 184 richieste / 61 appuntamenti / 17 incarichi / 2.630 € ads / 104.000 €.
- "Testato su 1.900 venditori veri".
- "Il tuo concorrente mi ha già scritto due volte".
- Esclusiva di zona / città / provincia.
- "Il 78% sceglie chi risponde per primo" — NON ha fonte primaria: se la incontri, segnalala.
  Il dato citabile è: entro 5 minuti si qualifica 21 volte di più che a 30 minuti
  (studio InsideSales/MIT, ripreso da Harvard Business Review 2011).

## Output richiesto per ogni carosello

```json
{
  "id": "carosello-NN",
  "slide": 7,
  "titolo": "",
  "cta": "PAROLA",
  "categoria": "educativo|contrarian|lista|caso studio|errore|confronto|framework|obiezione",
  "fase": "scoperta|consapevolezza|educazione|fiducia|considerazione|conversione",
  "verdetto": "OK" oppure "SCARTATO",
  "motivo_scarto": "",
  "cosa_correggere": "",
  "caption": "",
  "captionBreve": "",
  "primoCommento": "",
  "hashtag": [],
  "keyword": [],
  "altText": "",
  "testo_slide": ["testo integrale slide 1", "..."]
}
```

## QC linguistico — quando SCARTARE

Scarta il carosello e scrivi cosa correggere se trovi anche solo una di queste:
- errore di ortografia, grammatica o punteggiatura sulle slide;
- frase ambigua che si può leggere in due modi;
- periodo troppo lungo o contorto per essere letto in due secondi su un telefono;
- termine tecnico non spiegato che il target non userebbe mai;
- numero o affermazione che si contraddice tra due slide dello stesso carosello;
- promessa che il carosello non mantiene entro l'ultima slide.

NON scartare per: handle @pezzmarketing sbagliato, data "LUGLIO 2026" errata.
Sono noti e accettati dal cliente. Segnalali e basta.
