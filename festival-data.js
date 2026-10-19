// Proposal dates use traditional annual rules, not confirmed 2027 programmes.
export const festivalStatusLabels = {
  "annual-unconfirmed": "Jahrestermin · Programm 2027 noch prüfen",
  "programme-unconfirmed": "Abendprogramm für diesen Tag noch unbestätigt",
  "confirmed-2027": "Termin 2027 offiziell bestätigt",
};

export const festivalOptions = [
  {
    id: "iriya-asagao", title: "Iriya Asagao-matsuri · Prunkwinden-Markt",
    destination: "tokyo", category: "festival", proposedDates: ["2027-07-07"],
    dateStatus: "annual-unconfirmed",
    when: "Traditionell 6.–8. Juli; der 7. ist unser Vorschlag zum Ueno-Tag. Die Veranstalterseite bestätigt bisher keine Ausgabe 2027.",
    why: "Ein sommerlicher Markt rund um den Iriya-Kishimojin-Tempel mit Prunkwinden und japanischer Nachbarschaftsatmosphäre. Ein anderer Tokyo-Eindruck als die großen Shoppingviertel.",
    children: "Nur eine kurze Runde wählen, Getränke mitnehmen und bei Gedränge abkürzen. Prunkwinden blühen vor allem morgens; ein später Besuch ist eher Markt- als Blütenschau. Kein ruhiger, leerer Markt zugesagt.",
    logistics: "Beim Iriya-Kishimojin / Shingen-ji, nahe Iriya und Uguisudani. Ab Ueno einen eigenen Fußweg bzw. eine kurze Bahnfahrt einrechnen – nicht als Stopp ohne zusätzliche Wege behandeln.",
    planAdvice: "Am 7. Juli als kurze Alternative zum optionalen Asakusa-Teil oder vor dem Zoo, wenn ihr ohnehin früh wach seid. Nicht Zoo, Asakusa und Iriya als zusätzliches Pflichtprogramm stapeln. Erst nach Prüfung des 2027-Programms fest einplanen.",
    query: "Iriya Kishimojin Shingenji Temple Shitaya Taito Tokyo",
    url: "https://www.asagao-maturi.com/",
    sources: [{ label: "Taito City: zuletzt angekündigte Ausgabe", url: "https://www.city.taito.lg.jp/event/kanko/iriyaasagaomatsuri.html" }],
  },
  {
    id: "disney-believe", title: "DisneySea · Believe! Sea of Dreams",
    destination: "tokyo", category: "park-show", proposedDates: ["2027-07-09"],
    dateStatus: "programme-unconfirmed", placeId: "disney",
    when: "Nur als mögliche Ergänzung eures gewählten Parktags am 9. Juli. Eine Aufführung an diesem Datum ist noch nicht bestätigt.",
    why: "Eine etwa halbstündige Hafen-Show mit Booten, Projektionen, Lasern und pyrotechnischen Effekten. Das ist ein großes Abend-Spektakel, aber kein zugesagtes klassisches Feuerwerk.",
    children: "Nach dem langen Parktag nur bleiben, wenn alle noch Energie haben. Laute Effekte, späte Rückfahrt und volle Zuschauerbereiche mitdenken; ein früher Parkausstieg ist völlig in Ordnung.",
    logistics: "Im Mediterranean Harbor von DisneySea. Die Betreiberseite unterscheidet Bereiche ohne Vorabbuchung und gesonderte Premier-Access-/Paketbereiche. Gute Sicht oder ein bestimmter Platz sind nicht garantiert.",
    planAdvice: "Den tatsächlichen Tagesplan und mögliche Ausfälle in der offiziellen App prüfen. Kein zusätzliches Abendziel außerhalb des Parks anhängen und kein Showticket als bereits gebucht behandeln.",
    url: "https://www.tokyodisneyresort.jp/en/tds/show/detail/967/",
    sources: [],
  },
  {
    id: "sensoji-hozuki", title: "Senso-ji Hozuki-ichi · Lampionblumen-Markt",
    destination: "tokyo", category: "festival", proposedDates: ["2027-07-10"],
    dateStatus: "annual-unconfirmed", placeId: "sensoji",
    when: "Der Tempel nennt jährlich den 9. und 10. Juli. Für euch kommt der 10. infrage; der 9. bleibt DisneySea. Programm 2027 noch prüfen.",
    why: "Orangefarbene Lampionblumen und besondere Sommermarkt-Atmosphäre am Senso-ji. Der Tempelbesuch bekommt so einen Anlass, der nicht einfach ein weiterer gewöhnlicher Sightseeingstopp ist.",
    children: "Eher 30–60 Minuten als eine lange Tour durch Hitze und Menschenmengen. Einen Treffpunkt ausmachen, Wasser einpacken und Pflanzen lieber anschauen als als Reisesouvenir einplanen.",
    logistics: "In Asakusa am Senso-ji. Von Tsukiji/Ginza ist das eine zusätzliche Fahrt und nicht automatisch auf dem Weg nach Akihabara.",
    planAdvice: "Am 10. Juli statt des Ginza-Bummels oder eines Teils von Akihabara wählen, nicht zusätzlich zu allen drei Vierteln. Nach DisneySea keinen neuen Frühstart erzwingen; Zeit zum Packen vor Kyoto freihalten.",
    url: "https://www.senso-ji.jp/annual_event/13.html",
    sources: [],
  },
  {
    id: "gion-evening", title: "Gion Matsuri · Festwagen und Laternen",
    destination: "kyoto", category: "festival", proposedDates: ["2027-07-14"],
    dateStatus: "annual-unconfirmed", placeId: "matsuri",
    when: "Der reguläre Yoiyama-Zeitraum beginnt am 14. Juli. Das konkrete Programm und die Verkehrsregeln für 2027 stehen noch aus.",
    why: "Geschmückte Festwagen, Laternen und Gion-Bayashi-Musik in den innerstädtischen Festwagenvierteln. Unser besonders passender Festabend, weil ihr an diesem Tag ohnehin noch in Kyoto übernachtet.",
    children: "Nur einen überschaubaren Bereich ansehen und jederzeit gehen können. Nicht von autofreien Straßen, offenen Garküchen oder wenig Gedränge ausgehen; das muss im aktuellen Programm geprüft werden.",
    logistics: "Orientierungsgebiet Shijo-Karasuma und benachbarte Festwagenstraßen. Nach Kurama/Kibune zuerst zur Unterkunft zurück, essen und ausruhen; die Innenstadtfahrt separat einrechnen.",
    planAdvice: "Der kurze Abendspaziergang ist bereits als Option im 14. Juli vorgesehen. Wenn euch der Festabend wichtiger ist, die Wanderung verkürzen oder auslassen – kein erschöpftes Durchhalten. Vorher essen statt am 14. auf einen garantierten Streetfood-Abend zu setzen.",
    url: "https://www.yasaka-jinja.or.jp/event/gion02/",
    sources: [{ label: "Kyoto City: regulärer Festablauf", url: "https://ja.kyoto.travel/event/major/gion/" }],
  },
  {
    id: "gion-parade", title: "Gion Matsuri · Großer Festwagenumzug",
    destination: "kyoto", fromDestination: "osaka", category: "parade", proposedDates: ["2027-07-17"],
    dateStatus: "annual-unconfirmed", placeId: "matsuri",
    when: "Der erste Yamaboko-Umzug findet traditionell am 17. Juli statt. Uhrzeiten, Route und Zuschauerregelungen für 2027 noch bestätigen.",
    why: "Reich geschmückte Festwagen durch die Kyotoer Innenstadt und die aufwendigen Drehmanöver an den Kreuzungen: das eindrucksvollste Parade-Erlebnis dieser Auswahl.",
    children: "Ein kurzer Vormittags-Ausschnitt ist realistischer als ein ganzer Festtag. Mit Sommerhitze, Stehzeiten und Gedränge rechnen; keine schattigen Plätze oder freie Sicht versprechen.",
    logistics: "Das wäre ein Tagesausflug von eurer Osaka-Basis nach Kyoto. Metro, Bahnhofswechsel, Zug und Fußweg kommen zusammen – nicht mit einer halben Stunde von der Wohnung zum Zuschauerplatz rechnen.",
    planAdvice: "Nur ALS ERSATZ für Minoh und den optionalen Umeda-Teil am 17. Juli wählen, nicht davor oder danach. Der Vormittagsumzug erfordert eine frühe Anreise nach dem USJ-Tag; wenn das zu viel ist, bleibt der Laternenabend am 14. die bessere Festoption.",
    url: "https://ja.kyoto.travel/event/major/gion/",
    sources: [{ label: "Yasaka-Schrein: jährlicher Ablauf", url: "https://www.yasaka-jinja.or.jp/event/gion02/" }],
  },
];

export const fireworksContext = [
  {
    title: "Sumida-Feuerwerk · Tokyo",
    text: "Üblicherweise erst Ende Juli, während ihr Tokyo bereits am 11. Juli verlasst. Ein 2027-Termin ist noch nicht belegt; deshalb nicht als erreichbares Feuerwerk verplant.",
    url: "https://www.sumidagawa-hanabi.com/",
  },
  {
    title: "Tenjin Matsuri · Osaka",
    text: "Der traditionelle Haupttermin mit Bootsprozession und Feuerwerk liegt am 24./25. Juli. Ihr fliegt am 20. Juli weiter; deshalb ist dies kein passender Abend während eures Osaka-Aufenthalts.",
    url: "https://osakatemmangu.or.jp/saijireki/tjm",
  },
];
