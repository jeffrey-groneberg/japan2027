const railCheck = "Abfahrtszeit, Zugziel, Gleis und mögliche Betriebsänderungen am Reisetag in der offiziellen Betreiberanzeige prüfen.";
const driverCheck = "Fahrer, Fahrzeug, Preis, Treffpunkt, Wartezeit und Rückfahrt vorab schriftlich bestätigen.";

function connection(from, to, mode, duration, summary, steps, { ticket = "", verify = railCheck } = {}) {
  return { from, to, mode, duration, summary, steps, ticket, verify };
}

export const locationLabels = {
  "home-de": "Zuhause",
  "fra-airport": "Flughafen Frankfurt",
  haneda: "Flughafen Haneda",
  "tokyo-home": "Unterkunft in Komagome",
  "tokyo-station": "Tokyo Station",
  "kyoto-station": "Kyoto Station",
  "kyoto-home": "Unterkunft in Kyoto",
  "osaka-home": "Unterkunft bei Ebisucho",
  hirakuza: "HIRAKUZA · Namba Parks",
  "hirakuza-tokyo": "HIRAKUZA · Ginza Tokyo",
  "kansai-airport": "Flughafen Kansai",
  "danang-airport": "Flughafen Da Nang",
  "saigon-airport": "Flughafen Ho-Chi-Minh-Stadt",
  "bana-base": "Ba-Na-Hills-Talstation",
};

export const optionLocations = {
  "Sumo-Show mit Abendessen": "hirakuza",
  "HIRAKUZA Ginza statt Akihabara": "hirakuza-tokyo",
};

export const journeyProfiles = {
  "2027-07-03": { origin: "home-de", returnTo: null, stepLocations: { 1: "fra-airport", 2: "fra-airport" }, travelOnlySteps: [1], stepStarts: { 0: "08:30", 1: "11:00", 2: "13:55" } },
  "2027-07-04": { origin: "haneda", returnTo: "tokyo-home", stepLocations: { 0: "haneda", 1: "tokyo-home" }, travelOnlySteps: [1] },
  "2027-07-05": { origin: "tokyo-home", returnTo: "tokyo-home" },
  "2027-07-06": { origin: "tokyo-home", returnTo: "tokyo-home" },
  "2027-07-07": { origin: "tokyo-home", returnTo: "tokyo-home" },
  "2027-07-08": { origin: "tokyo-home", returnTo: "tokyo-home" },
  "2027-07-09": { origin: "tokyo-home", returnTo: "tokyo-home" },
  "2027-07-10": { origin: "tokyo-home", returnTo: "tokyo-home" },
  "2027-07-11": { origin: "tokyo-home", returnTo: "kyoto-home", stepLocations: { 0: "tokyo-station", 1: "kyoto-station" }, travelOnlySteps: [1] },
  "2027-07-12": { origin: "kyoto-home", returnTo: "kyoto-home" },
  "2027-07-13": { origin: "kyoto-home", returnTo: "kyoto-home" },
  "2027-07-14": { origin: "kyoto-home", returnTo: "kyoto-home", returnBefore: ["matsuri"] },
  "2027-07-15": { origin: "kyoto-home", returnTo: "osaka-home" },
  "2027-07-16": { origin: "osaka-home", returnTo: "osaka-home" },
  "2027-07-17": { origin: "osaka-home", returnTo: "osaka-home" },
  "2027-07-18": { origin: "osaka-home", returnTo: "osaka-home" },
  "2027-07-19": { origin: "osaka-home", returnTo: "osaka-home", returnBefore: ["tamade"] },
  "2027-07-20": { origin: "osaka-home", returnTo: "robinson", stepLocations: { 0: "kansai-airport" }, travelOnlySteps: [0], stepStarts: { 0: "07:30", 1: "15:30", 2: "18:30" } },
  "2027-07-21": { origin: "robinson", returnTo: "robinson" },
  "2027-07-22": { origin: "robinson", returnTo: "robinson", stepLocations: { 0: "robinson" } },
  "2027-07-23": { origin: "robinson", returnTo: "robinson" },
  "2027-07-24": { origin: "robinson", returnTo: "robinson" },
  "2027-07-25": { origin: "robinson", returnTo: "robinson" },
  "2027-07-26": { origin: "robinson", returnTo: "robinson", stepLocations: { 0: "bana-base", 2: "bana" }, travelOnlySteps: [0], placeDurations: { goldenBridge: 75, bana: 300 } },
  "2027-07-27": { origin: "robinson", returnTo: "robinson" },
  "2027-07-28": { origin: "robinson", returnTo: "robinson" },
  "2027-07-29": { origin: "robinson", returnTo: "robinson" },
  "2027-07-30": { origin: "robinson", returnTo: "robinson" },
  "2027-07-31": { origin: "robinson", returnTo: null, stepLocations: { 0: "robinson", 1: "danang-airport", 2: "saigon-airport" }, travelOnlySteps: [1, 2], stepStarts: { 0: "09:00", 1: "12:00", 2: "15:30" } },
  "2027-08-01": { origin: "fra-airport", returnTo: "home-de", stepLocations: { 0: "fra-airport", 1: "home-de" }, travelOnlySteps: [1] },
};

const connections = [
  connection("home-de", "fra-airport", "train", 75, "Mit S8/S9 oder einem vorbestellten Taxi zum tatsächlich gebuchten Abflugterminal.", [
    "In der Airline-Buchung zuerst Terminal und Check-in-Zeit prüfen.",
    "Bei Bahnwahl die passende S8/S9-Verbindung zum Frankfurt Flughafen Regionalbahnhof wählen und den ausgeschilderten Terminalweg einplanen.",
    "Bei Taxi- oder Vanfahrt das konkrete Terminal nennen und genügend Reserve für Verkehr und Gepäck lassen.",
  ], { ticket: "RMV-/DB-Fahrkarte passend zum tatsächlichen Startort; die konkrete Tarifzone hängt vom Wohnort ab.", verify: "Der Wohnort ist im Plan nicht hinterlegt. Verbindung und Fahrkarte deshalb mit dem tatsächlichen Startpunkt in RMV/DB prüfen." }),
  connection("fra-airport", "home-de", "train", 75, "Nach Gepäckausgabe per passender S-Bahn oder vorbestelltem Taxi nach Hause.", [
    "Zur ausgeschilderten Regionalbahnhof-Ebene oder zum offiziellen Taxistand gehen.",
    "S8/S9 nur wählen, wenn sie zum tatsächlichen Heimweg passt; sonst eine passende RMV-/DB-Verbindung nehmen.",
    "Bei Taxi oder Van das vollständige Ziel nennen und vor dem Einsteigen die Fahrzeuggröße prüfen.",
  ], { ticket: "Lokales RMV-/DB-Ticket oder Taxifahrt; japanische IC-Karten gelten nicht.", verify: "Die konkrete Heimadresse ist nicht Teil des öffentlichen Plans. Ziel, Ausstieg und letzte Etappe am Ankunftstag prüfen." }),
  connection("haneda", "tokyo-home", "train", 75, "Keikyu bis Shinagawa, dort zur JR Yamanote Line nach Komagome wechseln.", [
    "Im richtigen Haneda-Terminal den Schildern zur Keikyu Line folgen.",
    "Eine Keikyu-Verbindung Richtung Shinagawa nehmen; Zugziel und möglichen Durchlauf auf der Anzeige kontrollieren.",
    "In Shinagawa zu JR wechseln und die Yamanote Line in Richtung Tokyo / Ueno bis Komagome nehmen.",
    "Ab Komagome nur mit der vom Gastgeber bestätigten vollständigen Wohnungsadresse weitergehen.",
  ], { ticket: "Für die normalen Bahnabschnitte pro Person eine IC-Karte verwenden; Kinderkarte am bedienten Schalter mit Reisepass beantragen." }),
  connection("tokyo-home", "maruetsu", "walk", 15, "Zu Fuß von der bestätigten Unterkunft zum ausgewählten Maruetsu-Markt in Komagome.", [
    "Erst die endgültige Wohnungsadresse und die konkrete Maruetsu-Filiale in der Karten-App setzen.",
    "Auf beleuchteten Hauptwegen gehen und den Rückweg vor dem Einkauf speichern.",
  ], { verify: "Die private Wohnungsadresse ist noch nicht bekannt; deshalb darf der genaue Fußweg erst nach Bestätigung der Unterkunft festgelegt werden." }),
  connection("maruetsu", "tokyo-home", "walk", 15, "Auf demselben geprüften Fußweg zur Unterkunft zurück.", [
    "Vor dem Losgehen die bestätigte Wohnungsadresse als Ziel öffnen.",
    "Mit Einkäufen keine unbekannte Abkürzung durch Nebenstraßen nehmen.",
  ], { verify: "Genaue Route erst mit der finalen Unterkunftsadresse festlegen." }),
  connection("tokyo-home", "takeshita", "train", 35, "JR Yamanote Line von Komagome nach Harajuku.", [
    "In Komagome dem JR-Zugang zur Yamanote Line folgen, nicht der Tokyo-Metro-Namboku-Line.",
    "Die Yamanote Line über Ikebukuro und Shinjuku in Richtung Harajuku nehmen.",
    "In Harajuku den Ausgang Takeshita wählen; die Einkaufsstraße beginnt direkt gegenüber.",
  ], { ticket: "Normale JR-Stadtfahrt mit aufgeladener Suica/PASMO." }),
  connection("takeshita", "nintendoTokyo", "train", 20, "Eine Station mit der JR Yamanote Line von Harajuku nach Shibuya, dann zu Fuß zum Shibuya PARCO.", [
    "Zum JR-Bahnhof Harajuku zurückgehen.",
    "Yamanote Line eine Station bis Shibuya nehmen.",
    "In Shibuya den ausgeschilderten Ausgang zum PARCO wählen und zum 6. Geschoss fahren.",
  ]),
  connection("nintendoTokyo", "pokemon", "walk", 15, "Im selben 6. Geschoss des Shibuya PARCO zu Fuß zum Pokémon Center; mit Orientierung und möglicher Einlassschlange ist ein kleiner Puffer enthalten.", [
    "Im Gebäude bleiben; keine Bahn oder Straßenquerung nötig.",
    "Der Beschilderung im 6. Geschoss zum Pokémon Center SHIBUYA folgen.",
  ], { verify: "Aktuelle Laden- und Einlassorganisation am Besuchstag prüfen." }),
  connection("pokemon", "crossing", "walk", 15, "Vom Shibuya PARCO zu Fuß zur Scramble Crossing am Hachiko-Ausgang.", [
    "Vom PARCO auf der ausgeschilderten Route zurück Richtung Shibuya Station gehen.",
    "Als Treffpunkt vor dem Gedränge den Hachiko-Ausgang vereinbaren.",
  ]),
  connection("crossing", "sky", "walk", 15, "Zu Fuß von der Kreuzung durch Shibuya Station zum Shibuya Scramble Square; der Einlasspuffer ist enthalten.", [
    "Nach dem Überqueren den Schildern zu Shibuya Scramble Square / Shibuya Sky folgen.",
    "Genügend Zeit für den Gebäudeeinlass vor dem reservierten Zeitfenster lassen.",
  ], { verify: "Den aktuell vorgeschriebenen Eingang auf dem Ticket prüfen." }),
  connection("sky", "tokyo-home", "train", 35, "JR Yamanote Line von Shibuya zurück nach Komagome.", [
    "In Shibuya zum JR-Bereich der Yamanote Line gehen.",
    "Die Richtung über Shinjuku / Ikebukuro bis Komagome wählen.",
    "Die aktuelle Bahnsteiganzeige vor Ort kontrollieren.",
  ]),
  connection("nintendoTokyo", "akihabara", "train", 40, "Ab Shibuya mit der JR Yamanote Line nach Akihabara.", [
    "Vom PARCO zurück zur JR Shibuya Station gehen.",
    "Die Yamanote Line in Richtung Shinagawa / Tokyo bis Akihabara nehmen.",
    "In Akihabara einen passenden Ausgang für den ausgewählten Spieleladen wählen.",
  ]),
  connection("pokemon", "akihabara", "train", 40, "Vom Shibuya PARCO zurück zur JR-Station und mit der Yamanote Line nach Akihabara.", [
    "Das PARCO verlassen und zur JR Shibuya Station gehen.",
    "Die Yamanote Line in Richtung Shinagawa / Tokyo bis Akihabara nehmen.",
    "In Akihabara den passenden Ausgang für den ausgewählten Spieleladen wählen.",
  ]),
  connection("akihabara", "tokyo-home", "train", 20, "JR Yamanote Line von Akihabara zurück nach Komagome.", [
    "Am JR-Bahnhof Akihabara die Yamanote Line Richtung Ueno / Komagome nehmen.",
    "In Komagome zur bestätigten Unterkunft zurückgehen.",
  ]),
  connection("tokyo-home", "nintendoTokyo", "train", 40, "JR Yamanote Line von Komagome direkt nach Shibuya, dann zum Shibuya PARCO.", [
    "In Komagome den JR-Zugang wählen.",
    "Yamanote Line über Ikebukuro und Shinjuku bis Shibuya nehmen.",
    "Vom passenden Ausgang zu Fuß zum Shibuya PARCO und ins 6. Geschoss.",
  ]),
  connection("crossing", "tokyo-home", "train", 35, "JR Yamanote Line von Shibuya nach Komagome.", [
    "Zum JR-Bereich der Shibuya Station gehen.",
    "Yamanote Line Richtung Shinjuku / Ikebukuro bis Komagome nehmen.",
  ]),
  connection("tokyo-home", "teamlab", "train", 50, "Tokyo Metro Namboku Line bis Iidabashi, Yurakucho Line bis Toyosu, dann Yurikamome bis Shin-Toyosu.", [
    "In Komagome die Tokyo Metro Namboku Line Richtung Meguro bis Iidabashi nehmen.",
    "In Iidabashi zur Yurakucho Line Richtung Shin-kiba wechseln und bis Toyosu fahren.",
    "In Toyosu zur Yurikamome wechseln und eine Station bis Shin-Toyosu fahren.",
    "Vom Bahnhof zum gebuchten teamLab-Eingang gehen.",
  ]),
  connection("teamlab", "odaiba", "train", 25, "Mit der Yurikamome von Shin-Toyosu in Richtung Shimbashi zu einem passenden Odaiba-Ausstieg.", [
    "Zur Station Shin-Toyosu zurückgehen.",
    "Yurikamome Richtung Shimbashi nehmen.",
    "Für die Seaside-Park-Runde je nach gewünschtem Start Odaiba-kaihinkoen oder Daiba wählen.",
  ], { verify: "Den konkreten Parkzugang und damit den besten Ausstieg erst mit der gewünschten Spaziergangsroute festlegen." }),
  connection("odaiba", "tokyo-home", "train", 55, "Yurikamome bis Shimbashi, dort JR Yamanote Line nach Komagome.", [
    "Von Daiba oder Odaiba-kaihinkoen die Yurikamome Richtung Shimbashi nehmen.",
    "In Shimbashi zu JR wechseln.",
    "Yamanote Line Richtung Tokyo / Ueno bis Komagome nehmen.",
  ]),
  connection("tokyo-home", "zoo", "train", 25, "JR Yamanote Line von Komagome nach Ueno, dann zu Fuß zum bestätigten Zooeingang.", [
    "In Komagome die JR Yamanote Line Richtung Ueno nehmen.",
    "In Ueno den Park-Ausgang wählen.",
    "Zum laut Tageshinweis geöffneten Zooeingang gehen; nicht automatisch den nächstgelegenen Eingang voraussetzen.",
  ]),
  connection("zoo", "ueno", "walk", 15, "Zu Fuß vom Zoo in den Ueno-Park.", [
    "Den Zoo am gewünschten Ausgang verlassen.",
    "Der Parkbeschilderung zu einem schattigen Pausenbereich folgen.",
  ]),
  connection("zoo", "nakamise", "train", 25, "Vom Ueno-Gebiet mit der Tokyo Metro Ginza Line nach Asakusa.", [
    "Vom Zoo zum Tokyo-Metro-Bahnhof Ueno gehen.",
    "Ginza Line Richtung Asakusa bis zur Endstation nehmen.",
    "Den Ausgang zum Kaminarimon wählen; dort beginnt der Weg zur Nakamise.",
  ]),
  connection("tokyo-home", "nakamise", "train", 35, "JR Yamanote Line bis Ueno, dort Tokyo Metro Ginza Line bis Asakusa.", [
    "JR Yamanote von Komagome nach Ueno.",
    "In Ueno zur Ginza Line Richtung Asakusa wechseln.",
    "In Asakusa den Ausgang zum Kaminarimon nehmen.",
  ]),
  connection("nakamise", "sensoji", "walk", 15, "Zu Fuß durch die Nakamise vom Kaminarimon bis zum Senso-ji; Zeit zum Orientieren im Gedränge ist enthalten.", [
    "Der Ladenstraße geradeaus Richtung Hozomon und Haupthalle folgen.",
    "Bei Gedränge Treffpunkt und Straßenseite vereinbaren.",
  ]),
  connection("sensoji", "tokyo-home", "train", 35, "Ginza Line von Asakusa nach Ueno, dort JR Yamanote Line nach Komagome.", [
    "Zum Tokyo-Metro-Bahnhof Asakusa zurückgehen.",
    "Ginza Line Richtung Shibuya bis Ueno nehmen.",
    "In Ueno zu JR wechseln und mit der Yamanote Line nach Komagome fahren.",
  ]),
  connection("ueno", "tokyo-home", "train", 20, "JR Yamanote Line von Ueno zurück nach Komagome.", [
    "Zum JR-Bahnhof Ueno gehen.",
    "Yamanote Line Richtung Ikebukuro / Komagome nehmen.",
  ]),
  connection("tokyo-home", "takao", "train", 90, "JR Yamanote Line nach Shinjuku, dort zur Keio Line und weiter bis Takaosanguchi.", [
    "JR Yamanote Line von Komagome nach Shinjuku.",
    "In Shinjuku den eigenständigen Keio-Bereich suchen.",
    "Eine Keio-Verbindung bis Takaosanguchi nehmen; einen angezeigten Umstieg befolgen.",
    "Ab Takaosanguchi zu Fuß zur Talstation gehen; der POI-Pin markiert nicht den Bahnhof.",
  ]),
  connection("takao", "tokyo-home", "train", 90, "Von Takaosanguchi mit Keio nach Shinjuku, dort JR Yamanote Line nach Komagome.", [
    "Mit Reserve zur Talstation und weiter zum Bahnhof Takaosanguchi zurückgehen.",
    "Keio-Verbindung nach Shinjuku nehmen.",
    "In Shinjuku zu JR wechseln und die Yamanote Line nach Komagome nehmen.",
  ]),
  connection("tokyo-home", "ghibli", "train", 60, "JR Yamanote Line bis Shinjuku, JR Chuo Line bis Mitaka, dann etwa 15 Minuten zu Fuß.", [
    "Yamanote Line von Komagome nach Shinjuku.",
    "In Shinjuku zur JR Chuo Line wechseln und bis Mitaka fahren.",
    "Den Südausgang von Mitaka nehmen.",
    "Der offiziellen Museumsroute etwa 15 Minuten zu Fuß folgen.",
  ]),
  connection("ghibli", "tokyo-home", "train", 60, "Zu Fuß zurück nach Mitaka, JR Chuo Line nach Shinjuku und JR Yamanote Line nach Komagome.", [
    "Auf der offiziellen Route zum Bahnhof Mitaka zurückgehen.",
    "JR Chuo Line bis Shinjuku.",
    "Dort JR Yamanote Line bis Komagome.",
  ]),
  connection("tokyo-home", "miraikan", "train", 60, "Namboku Line bis Iidabashi, Yurakucho Line bis Toyosu, Yurikamome bis Tokyo International Cruise Terminal.", [
    "Namboku Line von Komagome bis Iidabashi.",
    "Yurakucho Line Richtung Shin-kiba bis Toyosu.",
    "Yurikamome Richtung Shimbashi bis Tokyo International Cruise Terminal.",
    "Von dort der Museumsbeschilderung zum Miraikan folgen.",
  ]),
  connection("miraikan", "tokyo-home", "train", 60, "Yurikamome bis Shimbashi, dort JR Yamanote Line nach Komagome.", [
    "Zur Station Tokyo International Cruise Terminal zurückgehen.",
    "Yurikamome Richtung Shimbashi.",
    "In Shimbashi JR Yamanote Line Richtung Ueno / Komagome.",
  ]),
  connection("tokyo-home", "disney", "train", 70, "JR Yamanote Line bis Tokyo Station, JR Keiyo Line bis Maihama, Disney Resort Line bis Tokyo DisneySea Station.", [
    "JR Yamanote Line von Komagome nach Tokyo Station.",
    "In Tokyo Station den längeren ausgeschilderten Fußweg zur Keiyo Line einplanen; dafür bewusst etwa 10–15 Minuten Reserve lassen.",
    "Keiyo- oder passende Musashino-Verbindung bis Maihama nehmen.",
    "Zur Resort Gateway Station gehen und mit der Disney Resort Line bis Tokyo DisneySea Station fahren.",
  ], { ticket: "JR-Nahverkehr und Disney Resort Line getrennt betrachten; der Parkeintritt ist keine Bahnfahrkarte." }),
  connection("disney", "tokyo-home", "train", 70, "Disney Resort Line nach Resort Gateway, JR ab Maihama nach Tokyo und Yamanote Line nach Komagome.", [
    "Disney Resort Line bis Resort Gateway Station.",
    "Zu JR Maihama gehen und eine Keiyo-/Musashino-Verbindung nach Tokyo nehmen.",
    "In Tokyo Station zur Yamanote Line wechseln und bis Komagome fahren.",
  ]),
  connection("tokyo-home", "tsukiji", "train", 40, "JR Yamanote Line bis Ueno, dort Tokyo Metro Hibiya Line bis Tsukiji.", [
    "JR Yamanote Line von Komagome nach Ueno.",
    "In Ueno zur Hibiya Line Richtung Naka-meguro wechseln.",
    "In Tsukiji aussteigen und zum Außenmarkt gehen.",
  ]),
  connection("tsukiji", "ginza", "walk", 18, "Zu Fuß vom Tsukiji-Außenmarkt nach Ginza.", [
    "Den Markt in Richtung Ginza / Higashi-ginza verlassen.",
    "Eine geprüfte Fußroute zum gewünschten Kaufhaus oder Orientierungspunkt öffnen.",
  ]),
  connection("ginza", "akihabara", "train", 20, "Tokyo Metro Hibiya Line ab Ginza oder Higashi-ginza bis Akihabara.", [
    "Zum näheren Hibiya-Line-Bahnhof Ginza oder Higashi-ginza gehen.",
    "Hibiya Line Richtung Kita-senju bis Akihabara nehmen.",
    "Den passenden Ausgang für den ausgewählten Laden wählen.",
  ]),
  connection("ginza", "hirakuza-tokyo", "walk", 15, "Zu Fuß vom Ginza-Bummel zum HIRAKUZA im Prime Ginza Yanagidori Building.", [
    "Als Ziel 1-9-13 Ginza, Prime Ginza Yanagidori Building öffnen.",
    "Vom Ginza-Umfeld in Richtung Ginza-itchome gehen.",
    "Das Restaurant liegt im 1. Untergeschoss; genug Zeit für Einlass und Sitzplatzsuche lassen.",
  ], { verify: "Der Betreiber nennt eine Minute ab Ginza-itchome Ausgang 10 und vier Minuten ab Ginza Ausgang A13. Den tatsächlich genutzten Ausgang am Besuchstag prüfen." }),
  connection("hirakuza-tokyo", "tokyo-home", "train", 45, "Zu Fuß zum JR-Bahnhof Yurakucho und mit der Yamanote Line direkt nach Komagome.", [
    "Nach der Show zum JR-Bahnhof Yurakucho, Zentral-Ausgang, gehen; der Betreiber nennt etwa sieben Minuten Fußweg.",
    "Die JR Yamanote Line Richtung Tokyo / Ueno / Komagome nehmen.",
    "In Komagome zur bestätigten Unterkunft zurückgehen.",
  ], { ticket: "Normale JR-Stadtfahrt mit aufgeladener Suica/PASMO.", verify: "Die konkrete Bahnsteiganzeige und letzte passende Verbindung am Abend vor Ort prüfen." }),
  connection("tsukiji", "akihabara", "train", 20, "Tokyo Metro Hibiya Line von Tsukiji direkt nach Akihabara.", [
    "Zur Hibiya-Line-Station Tsukiji gehen.",
    "Hibiya Line Richtung Kita-senju bis Akihabara nehmen.",
  ]),
  connection("tsukiji", "tokyo-home", "train", 40, "Hibiya Line von Tsukiji nach Ueno, dort JR Yamanote Line nach Komagome.", [
    "Tokyo Metro Hibiya Line von Tsukiji Richtung Kita-senju bis Ueno.",
    "In Ueno zum JR-Bereich wechseln.",
    "JR Yamanote Line bis Komagome.",
  ]),
  connection("tokyo-home", "tokyo-station", "train", 25, "JR Yamanote Line von Komagome nach Tokyo Station.", [
    "Mit Gepäck zum JR-Bereich in Komagome gehen.",
    "Yamanote Line Richtung Ueno / Tokyo bis Tokyo Station.",
    "Zusätzlichen Fußweg zum Tokaido-Shinkansen einplanen.",
  ]),
  connection("tokyo-station", "kyoto-station", "train", 150, "Reservierter Tokaido-Shinkansen von Tokyo nach Kyoto.", [
    "Zum Tokaido-/Sanyo-Shinkansen-Übergang gehen.",
    "Zugname, Abfahrtszeit, Wagen und Sitzplätze mit der Reservierung abgleichen.",
    "Den gebuchten Zug nach Kyoto nehmen; keine spontane Zugart annehmen.",
  ], { ticket: "Eigenes Shinkansen-Ticket mit Sitzplatz über smartEX oder JR-Schalter; eine IC-Karte allein genügt nicht." }),
  connection("kyoto-station", "gion", "taxi", 35, "Mit vollständiger Unterkunftsadresse einchecken, danach per Keihan oder zu Fuß nach Gion.", [
    "An Kyoto Station ein offizielles Taxi zur bestätigten Unterkunft nehmen oder die vom Gastgeber empfohlene Verbindung nutzen.",
    "Gepäck abstellen und Check-in abschließen.",
    "Ab Kiyomizu-Gojo eine Station mit Keihan nach Gion-Shijo fahren oder den geprüften Fußweg wählen.",
  ], { ticket: "Taxi und Keihan sind getrennte Leistungen.", verify: "Die genaue Unterkunftsadresse und Check-in-Regel vor Abfahrt bestätigen; erst damit lässt sich die erste Etappe sicher festlegen." }),
  connection("gion", "pontocho", "walk", 15, "Zu Fuß über die Shijo-Brücke von Gion nach Pontocho.", [
    "Auf öffentlichen Straßen westwärts zum Kamo-Fluss gehen.",
    "Die Shijo-Brücke überqueren und in die öffentlich zugängliche Pontocho-Gasse einbiegen.",
  ]),
  connection("pontocho", "kyoto-home", "train", 20, "Zu Fuß zur Keihan-Station Gion-Shijo und eine Station bis Kiyomizu-Gojo.", [
    "Von Pontocho zurück über den Fluss zur Station Gion-Shijo gehen.",
    "Keihan Main Line Richtung Süden eine Station bis Kiyomizu-Gojo.",
    "Von dort zur bestätigten Unterkunft gehen.",
  ]),
  connection("kyoto-home", "inari", "train", 20, "Keihan Main Line von Kiyomizu-Gojo bis Fushimi-Inari.", [
    "An Kiyomizu-Gojo die Keihan Main Line Richtung Süden nehmen.",
    "In Fushimi-Inari aussteigen.",
    "Dem ausgeschilderten Fußweg zum Schrein folgen.",
  ]),
  connection("inari", "museum", "train", 45, "Keihan bis Tambabashi, zu Kintetsu wechseln und bis Ogura fahren.", [
    "Keihan ab Fushimi-Inari Richtung Süden bis Tambabashi.",
    "Zum benachbarten Kintetsu-Tambabashi wechseln.",
    "Eine normale Kintetsu-Verbindung bis Ogura nehmen.",
    "Den Ostausgang nutzen und Nintendos offiziellem Fußweg folgen; JR Ogura ist ein anderer Bahnhof.",
  ], { verify: "Nintendo verlangt öffentliche Verkehrsmittel und schließt die Anreise per Taxi aus." }),
  connection("museum", "kyoto-home", "train", 45, "Kintetsu Ogura bis Tambabashi, dort Keihan bis Kiyomizu-Gojo.", [
    "Zum Kintetsu-Bahnhof Ogura zurückgehen.",
    "Kintetsu bis Tambabashi.",
    "Zu Keihan wechseln und bis Kiyomizu-Gojo fahren.",
  ]),
  connection("inari", "nishiki", "train", 35, "Keihan von Fushimi-Inari bis Gion-Shijo, dann zu Fuß zum Nishiki-Markt.", [
    "Keihan Main Line Richtung Norden bis Gion-Shijo.",
    "Zu Fuß westwärts über Shijo und in Richtung Nishiki-Markt gehen.",
  ]),
  connection("nishiki", "kyoto-home", "walk", 25, "Zu Fuß vom Nishiki-Markt zur Unterkunft oder über Gion-Shijo mit Keihan.", [
    "Je nach Müdigkeit den geprüften Fußweg wählen.",
    "Alternativ zur Station Gion-Shijo gehen und eine Station bis Kiyomizu-Gojo fahren.",
  ]),
  connection("kyoto-home", "nara", "train", 75, "Keihan bis Tambabashi, dort Kintetsu bis Kintetsu-Nara.", [
    "Keihan von Kiyomizu-Gojo bis Tambabashi.",
    "Zum Kintetsu-Bahnhof wechseln.",
    "Eine normale Verbindung nach Kintetsu-Nara nehmen.",
    "Bei einem als Limited Express bezeichneten Zug nur mit passendem Zuschlag / reserviertem Ticket einsteigen.",
  ]),
  connection("nara", "todaiji", "walk", 25, "Zu Fuß vom Nara-Park durch das Parkgelände zum Todai-ji.", [
    "Der öffentlichen Beschilderung zur Großen Buddhahalle folgen.",
    "Hirschen ausweichen und Essen sicher verstauen.",
  ]),
  connection("todaiji", "kyoto-home", "train", 90, "Zu Fuß zurück nach Kintetsu-Nara, Kintetsu bis Tambabashi und Keihan bis Kiyomizu-Gojo.", [
    "Mit genug Reserve zum Bahnhof Kintetsu-Nara zurückgehen.",
    "Kintetsu bis Tambabashi.",
    "Zu Keihan wechseln und bis Kiyomizu-Gojo fahren.",
  ]),
  connection("nara", "kyoto-home", "train", 80, "Kintetsu-Nara bis Tambabashi, dort Keihan bis Kiyomizu-Gojo.", [
    "Zum Bahnhof Kintetsu-Nara zurückgehen.",
    "Kintetsu bis Tambabashi.",
    "Zu Keihan wechseln und bis Kiyomizu-Gojo fahren.",
  ]),
  connection("kyoto-home", "uzumasa", "train", 45, "Keihan bis Sanjo, Kyoto Subway Tozai Line bis Uzumasa Tenjingawa, dann zu Fuß.", [
    "Keihan von Kiyomizu-Gojo bis Sanjo.",
    "Zum U-Bahnhof Sanjo Keihan wechseln.",
    "Tozai Line Richtung Uzumasa Tenjingawa bis zur Endstation.",
    "Laut Betreiber etwa 14 Minuten zu Fuß zum Haupteingang.",
  ]),
  connection("uzumasa", "kyoto-home", "train", 45, "Zu Fuß nach Uzumasa Tenjingawa, Tozai Line bis Sanjo Keihan und Keihan bis Kiyomizu-Gojo.", [
    "Zum U-Bahnhof Uzumasa Tenjingawa zurückgehen.",
    "Tozai Line bis Sanjo Keihan.",
    "Zu Keihan Sanjo wechseln und bis Kiyomizu-Gojo fahren.",
  ]),
  connection("kyoto-home", "kurama", "train", 65, "Keihan bis Demachiyanagi, dort Eizan Railway bis Kurama.", [
    "Keihan von Kiyomizu-Gojo bis Demachiyanagi.",
    "Zum Eizan-Bahnhof wechseln.",
    "Eizan Kurama Line bis Kurama nehmen.",
    "Vom Bahnhof zum Tempelzugang gehen.",
  ]),
  connection("kurama", "kifune", "walk", 120, "Zu Fuß über den markierten Bergweg von Kurama nach Kibune.", [
    "Wegzustand und Wetter vor dem Einstieg prüfen.",
    "Nur dem offiziell geöffneten Wanderweg folgen.",
    "Bei Sperrung oder rutschigen Bedingungen nicht queren, sondern per Bahn und Bus nach Kibune fahren.",
  ], { verify: "Diese Etappe ist eine Bergwanderung, keine kurze Straßenverbindung. Sperrungen und Wetter am selben Tag prüfen." }),
  connection("kyoto-home", "kifune", "train", 80, "Keihan bis Demachiyanagi, Eizan bis Kibuneguchi und Kyoto Bus 33 bis Kibune.", [
    "Keihan von Kiyomizu-Gojo bis Demachiyanagi.",
    "Eizan Kurama Line bis Kibuneguchi.",
    "Am Bahnhof in den Kyoto Bus 33 Richtung Kibune umsteigen.",
    "An der passenden Haltestelle aussteigen und zum Schrein gehen.",
  ], { ticket: "IC-Nutzung und Busbetrieb am Besuchstag prüfen; bei starkem Andrang zusätzliche Wartezeit einplanen." }),
  connection("kifune", "kyoto-home", "train", 80, "Kyoto Bus 33 nach Kibuneguchi, Eizan bis Demachiyanagi und Keihan bis Kiyomizu-Gojo.", [
    "Zur passenden Kibune-Haltestelle gehen.",
    "Kyoto Bus 33 zurück zum Bahnhof Kibuneguchi.",
    "Eizan Railway bis Demachiyanagi.",
    "Zu Keihan wechseln und bis Kiyomizu-Gojo fahren.",
  ]),
  connection("kyoto-home", "matsuri", "train", 30, "Keihan von Kiyomizu-Gojo bis Gion-Shijo, dann zu Fuß ins bestätigte Festgebiet.", [
    "Keihan eine Station bis Gion-Shijo.",
    "Zu Fuß nur in den für 2027 offiziell ausgewiesenen öffentlichen Festbereich gehen.",
    "Vor Betreten des Gedränges einen Treffpunkt festlegen.",
  ], { verify: "Straßensperrungen, Festwagenstandorte und Zugangsregeln für den konkreten 2027-Abend zeitnah prüfen." }),
  connection("matsuri", "kyoto-home", "train", 30, "Zu Fuß nach Gion-Shijo und mit Keihan eine Station bis Kiyomizu-Gojo.", [
    "Bei dichtem Gedränge frühzeitig den öffentlichen Festbereich verlassen.",
    "Zur Station Gion-Shijo gehen.",
    "Keihan Richtung Süden bis Kiyomizu-Gojo.",
  ]),
  connection("kyoto-home", "bamboo", "train", 55, "Zu Fuß nach Kyoto-Kawaramachi, Hankyu über Katsura nach Arashiyama.", [
    "Von der Unterkunft zum Hankyu-Bahnhof Kyoto-Kawaramachi gehen.",
    "Hankyu Kyoto Line bis Katsura.",
    "Dort in die Hankyu Arashiyama Line bis Arashiyama wechseln.",
    "Zu Fuß zum Bambushain gehen.",
  ]),
  connection("bamboo", "monkey", "walk", 25, "Zu Fuß vom Bambushain über den Fluss zum Eingang des Iwatayama-Affenparks.", [
    "Richtung Togetsukyo-Brücke gehen.",
    "Die Brücke überqueren und dem ausgeschilderten Parkzugang folgen.",
    "Der eigentliche Aufstieg beginnt erst am Eingang und ist kein ebener Spaziergang.",
  ]),
  connection("monkey", "kyoto-home", "train", 65, "Zur Hankyu-Station Arashiyama, über Katsura nach Kyoto-Kawaramachi und zur Unterkunft.", [
    "Vom Affenpark vollständig zum Fluss und Bahnhof zurückgehen.",
    "Hankyu Arashiyama Line bis Katsura.",
    "Hankyu Kyoto Line bis Kyoto-Kawaramachi.",
    "Zur Unterkunft gehen und Gepäck holen.",
  ]),
  connection("monkey", "dotonbori", "train", 170, "Vom Affenpark zur Kyoto-Unterkunft zurück, Gepäck holen und anschließend über Keihan und Osaka Metro nach Dotonbori.", [
    "Vom Affenpark vollständig zum Bahnhof Hankyu Arashiyama zurückgehen.",
    "Über Katsura nach Kyoto-Kawaramachi fahren und zur Unterkunft gehen.",
    "Gepäck holen und ab Kiyomizu-Gojo eine passende Keihan-Verbindung bis Kitahama nehmen.",
    "In Kitahama zur Osaka Metro Sakaisuji Line wechseln und bis Ebisucho fahren.",
    "Einchecken, dann zu Fuß oder eine Station per Metro nach Dotonbori.",
  ], { verify: "Die konkrete Keihan-Verbindung und die Check-in-Zeit am Umzugstag prüfen; bei Verspätung Dotonbori ohne Zögern kürzen." }),
  connection("bamboo", "kyoto-home", "train", 55, "Hankyu Arashiyama Line über Katsura nach Kyoto-Kawaramachi, dann zur Unterkunft.", [
    "Zur Hankyu-Station Arashiyama gehen.",
    "Über Katsura nach Kyoto-Kawaramachi fahren.",
    "Zur Unterkunft zurückgehen und Gepäck holen.",
  ]),
  connection("kyoto-home", "dotonbori", "train", 105, "Keihan bis Kitahama, Osaka Metro Sakaisuji Line bis Ebisucho, einchecken und weiter nach Dotonbori.", [
    "Mit Gepäck an Kiyomizu-Gojo in eine passende Keihan-Verbindung Richtung Osaka / Kitahama steigen.",
    "In Kitahama zur Osaka Metro Sakaisuji Line wechseln und bis Ebisucho fahren.",
    "In der Unterkunft einchecken und Gepäck abstellen.",
    "Zu Fuß oder eine Station mit der Sakaisuji Line bis Nippombashi und weiter zum Dotonbori-Kanal.",
  ]),
  connection("dotonbori", "osaka-home", "walk", 25, "Zu Fuß von Dotonbori zur Unterkunft bei Ebisucho oder kurz per Metro über Nippombashi.", [
    "Den vorher geprüften Fußweg Richtung Nipponbashi / Ebisucho nutzen.",
    "Bei Müdigkeit ab Nippombashi eine Station mit der Sakaisuji Line bis Ebisucho fahren.",
  ]),
  connection("osaka-home", "usj", "train", 50, "Zu Fuß nach Shin-Imamiya, JR Osaka Loop Line bis Nishikujo, JR Yumesaki Line bis Universal City.", [
    "Zur JR-Station Shin-Imamiya gehen; nicht versehentlich den Nankai-Bereich wählen.",
    "JR Osaka Loop Line Richtung Nishikujo.",
    "In Nishikujo zur JR Yumesaki / Sakurajima Line wechseln.",
    "In Universal City aussteigen und dem Fußweg zum USJ-Eingang folgen.",
  ]),
  connection("usj", "nintendoWorld", "walk", 15, "Innerhalb der Universal Studios Japan zum bestätigten Eingang von Super Nintendo World.", [
    "Parkeinlass und gegebenenfalls Bereichszeitfenster zuerst in der offiziellen App prüfen.",
    "Im Park der Beschilderung zu Super Nintendo World folgen.",
  ], { verify: "Der Bereichseinlass kann zeitlich gesteuert sein; nie nur aufgrund dieses Wegblocks als garantiert ansehen." }),
  connection("nintendoWorld", "osaka-home", "train", 50, "Zu Fuß nach Universal City, JR Yumesaki Line bis Nishikujo und Osaka Loop Line bis Shin-Imamiya.", [
    "Zum Bahnhof Universal City zurückgehen.",
    "JR Yumesaki / Sakurajima Line bis Nishikujo.",
    "JR Osaka Loop Line bis Shin-Imamiya.",
    "Zu Fuß zur Unterkunft.",
  ]),
  connection("usj", "osaka-home", "train", 50, "JR ab Universal City über Nishikujo nach Shin-Imamiya, dann zu Fuß zur Unterkunft.", [
    "Universal City bis Nishikujo mit der JR Yumesaki Line.",
    "In Nishikujo zur Osaka Loop Line bis Shin-Imamiya wechseln.",
  ]),
  connection("osaka-home", "minoh", "train", 80, "Osaka Metro nach Umeda, Hankyu über Ishibashi handai-mae bis Mino-o, dann zu Fuß.", [
    "Von Ebisucho mit der Sakaisuji Line bis Dobutsuen-mae und dort zur Midosuji Line wechseln.",
    "Midosuji Line bis Umeda.",
    "Zum Hankyu-Bahnhof Osaka-Umeda gehen.",
    "Hankyu Takarazuka Line bis Ishibashi handai-mae, dort in die Mino-o Line bis Mino-o wechseln.",
    "Vom Bahnhof dem Wanderweg zum Wasserfall folgen.",
  ], { verify: "Der konkrete Metroeinstieg kann je nach endgültiger Unterkunft auch anders sinnvoll sein; Startweg nach bestätigter Adresse prüfen." }),
  connection("minoh", "umeda", "train", 60, "Zu Fuß zurück nach Mino-o, Hankyu über Ishibashi handai-mae nach Osaka-Umeda.", [
    "Den vollständigen Rückweg zum Bahnhof Mino-o einplanen.",
    "Hankyu Mino-o Line bis Ishibashi handai-mae.",
    "Zur Takarazuka Line Richtung Osaka-Umeda wechseln.",
    "Vom Bahnhof zu Fuß zum Umeda Sky Building.",
  ]),
  connection("osaka-home", "umeda", "train", 35, "Osaka Metro Sakaisuji Line bis Dobutsuen-mae, Midosuji Line bis Umeda.", [
    "Sakaisuji Line von Ebisucho eine Station bis Dobutsuen-mae.",
    "Zur Midosuji Line wechseln und bis Umeda fahren.",
    "Zu Fuß zum Umeda Sky Building; der Weg durch das Bahnhofsviertel braucht Puffer.",
  ]),
  connection("umeda", "osaka-home", "train", 35, "Midosuji Line von Umeda bis Dobutsuen-mae, dort Sakaisuji Line bis Ebisucho.", [
    "Zum Osaka-Metro-Bahnhof Umeda gehen.",
    "Midosuji Line Richtung Nakamozu bis Dobutsuen-mae.",
    "Zur Sakaisuji Line wechseln und eine Station bis Ebisucho.",
  ]),
  connection("osaka-home", "castle", "train", 35, "Sakaisuji Line bis Sakaisuji-Hommachi, dort Chuo Line bis Tanimachi 4-chome.", [
    "Sakaisuji Line von Ebisucho bis Sakaisuji-Hommachi.",
    "Zur Chuo Line Richtung Yumeshima wechseln.",
    "In Tanimachi 4-chome aussteigen.",
    "Den ausgeschilderten längeren Fußweg durch den Burgpark einplanen.",
  ]),
  connection("castle", "denden", "train", 35, "Zurück nach Tanimachi 4-chome, Chuo Line bis Sakaisuji-Hommachi und Sakaisuji Line bis Ebisucho.", [
    "Durch den Burgpark zur Station Tanimachi 4-chome zurückgehen.",
    "Chuo Line bis Sakaisuji-Hommachi.",
    "Sakaisuji Line bis Ebisucho.",
    "Zu Fuß nordwärts in den gewünschten Den-Den-Town-Bereich.",
  ]),
  connection("denden", "hirakuza", "walk", 20, "Zu Fuß vom Den-Den-Town-/Nipponbashi-Bereich zu Namba Parks.", [
    "Westwärts Richtung Nankai Namba gehen.",
    "Der Beschilderung zu Namba Parks folgen.",
    "Im Gebäude zum Sumo Hall HIRAKUZA im 8. Stock fahren.",
  ]),
  connection("hirakuza", "osaka-home", "walk", 20, "Zu Fuß von Namba Parks zurück zur Unterkunft bei Ebisucho.", [
    "Namba Parks über den ausgeschilderten Ausgang Richtung Nipponbashi / Ebisucho verlassen.",
    "Den vorher geprüften Fußweg zur Unterkunft nutzen.",
  ]),
  connection("denden", "osaka-home", "walk", 15, "Zu Fuß durch Den Den Town zurück zur Unterkunft bei Ebisucho.", [
    "Südwärts entlang der Hauptstraße Richtung Ebisucho gehen.",
    "Die bestätigte Unterkunftsadresse als Ziel öffnen.",
  ]),
  connection("castle", "osaka-home", "train", 35, "Tanimachi 4-chome bis Sakaisuji-Hommachi mit der Chuo Line, dann Sakaisuji Line bis Ebisucho.", [
    "Zum Bahnhof Tanimachi 4-chome zurückgehen.",
    "Chuo Line bis Sakaisuji-Hommachi.",
    "Sakaisuji Line bis Ebisucho.",
  ]),
  connection("osaka-home", "aquarium", "train", 45, "Sakaisuji Line bis Sakaisuji-Hommachi, Chuo Line bis Osakako, dann zu Fuß zum Kaiyukan.", [
    "Sakaisuji Line von Ebisucho bis Sakaisuji-Hommachi.",
    "Zur Chuo Line Richtung Yumeshima wechseln.",
    "In Osakako aussteigen.",
    "Dem ausgeschilderten Fußweg zum Kaiyukan folgen.",
  ]),
  connection("aquarium", "osaka-home", "train", 45, "Chuo Line ab Osakako bis Sakaisuji-Hommachi, dort Sakaisuji Line bis Ebisucho.", [
    "Zum Bahnhof Osakako zurückgehen.",
    "Chuo Line bis Sakaisuji-Hommachi.",
    "Zur Sakaisuji Line wechseln und bis Ebisucho.",
  ]),
  connection("osaka-home", "tamade", "walk", 15, "Zu Fuß von der Unterkunft zur bestätigten Super-Tamade-Filiale Ebisu.", [
    "Die konkrete Ebisu-Filiale und Öffnung in der offiziellen Filialliste prüfen.",
    "Den kurzen Fußweg mit der bestätigten Unterkunftsadresse planen.",
  ], { verify: "Genaue Route hängt von der endgültigen Unterkunft ab." }),
  connection("tamade", "osaka-home", "walk", 15, "Zu Fuß auf der geprüften Route zurück zur Unterkunft.", [
    "Die bestätigte Unterkunftsadresse als Ziel verwenden.",
  ], { verify: "Genaue Route hängt von der endgültigen Unterkunft ab." }),
  connection("osaka-home", "kansai-airport", "train", 65, "Zu Fuß nach Shin-Imamiya und mit einem reservierten Nankai Rapi:t zum Kansai Airport.", [
    "Zum Nankai-Bereich der Station Shin-Imamiya gehen, nicht zu JR.",
    "Den gebuchten Rapi:t-Zug, Wagen und Sitzplatz prüfen.",
    "Bis Kansai-airport fahren.",
    "Am Flughafen zum tatsächlich gebuchten Airline-Terminal wechseln.",
  ], { ticket: "Nankai-Rapi:t-Ticket einschließlich Express-/Sitzplatzanteil; eine IC-Karte allein ersetzt die Reservierung nicht." }),
  connection("kansai-airport", "robinson", "flight", 420, "Gebuchten Flug nach Da Nang nehmen und dort mit dem vorbestellten Fahrer zum ROBINSON Nam Hoi An an Tam Tien Beach.", [
    "Nur den tatsächlich bestätigten Flug und das darauf abgestimmte Terminal verwenden.",
    "In Da Nang Gepäck abholen und den schriftlich vereinbarten Fahrer am bestätigten Treffpunkt finden.",
    "Hotelname und Adresse abgleichen: ROBINSON Nam Hoi An liegt an Tam Tien Beach, nicht in Hoi An Altstadt.",
    "Die lange Straßenfahrt mit einer Pause für die Kinder planen.",
  ], { ticket: "Flug und privater Clubtransfer sind getrennte Buchungen.", verify: "Die angekündigte Direktstrecke bestätigt keinen konkreten Flug am 20. Juli 2027. Flugnummer, Zeiten, Terminal und Transfer erst nach Buchung in die Lane übernehmen." }),
  connection("robinson", "hoian", "car", 70, "Mit einem vorab vereinbarten privaten Fahrer oder bestätigten Clubshuttle vom ROBINSON nach Hoi An.", [
    "An der Rezeption Fahrzeug, Kindersitze, Preis und Abholzeit bestätigen.",
    "Als Ziel eine erreichbare Absetzstelle außerhalb der gesperrten Altstadtgassen vereinbaren.",
    "Noch vor dem Aussteigen den Rückfahrt-Treffpunkt und die Uhrzeit wiederholen.",
  ], { ticket: "Separater Transfer; Suica/PASMO gelten nicht.", verify: driverCheck }),
  connection("hoian", "robinson", "car", 70, "Am vereinbarten Treffpunkt mit demselben bestätigten Fahrer zurück zum ROBINSON.", [
    "Rechtzeitig zur erreichbaren Abholstelle außerhalb der Fußgängerzone gehen.",
    "Fahrername, Fahrzeug und Hotelziel abgleichen.",
    "Nicht spontan an einem anderen Ort eine Abholung voraussetzen.",
  ], { verify: driverCheck }),
  connection("robinson", "marble", "car", 95, "Mit einem vorab gebuchten Fahrer vom ROBINSON Tam Tien zum Thuy-Son-Besuchsbereich der Marble Mountains.", [
    "Ziel ausdrücklich als Marble Mountains / Thuy Son mit gewünschtem Eingang nennen.",
    "Hin- und Rückfahrt sowie Wartezeit vor Abfahrt bestätigen.",
    "Am Eingang mit dem Fahrer einen klaren, erreichbaren Abholpunkt vereinbaren.",
  ], { verify: driverCheck }),
  connection("marble", "robinson", "car", 95, "Vom vereinbarten Thuy-Son-Abholpunkt mit dem bestätigten Fahrer zurück zum ROBINSON.", [
    "Den vorher festgelegten Ausgang und Treffpunkt benutzen.",
    "Fahrer und Fahrzeug vor dem Einsteigen abgleichen.",
  ], { verify: driverCheck }),
  connection("robinson", "bana-base", "car", 130, "Mit einem vorab gebuchten Tagesfahrer vom ROBINSON zur für das Ticket richtigen Ba-Na-Hills-Talstation.", [
    "Dem Fahrer das offizielle Ticket bzw. die darin genannte Talstation zeigen.",
    "Gesamtpreis, Wartezeit, Kontaktweg und späteste Rückfahrt schriftlich bestätigen.",
    "Nicht Da Nang Stadt als Abfahrtsbasis verwenden; der Club liegt deutlich weiter südlich.",
  ], { verify: driverCheck }),
  connection("bana-base", "goldenBridge", "cable", 35, "Mit der im gültigen Ticket vorgesehenen Seilbahnroute in die Berganlage und zur Golden Bridge.", [
    "Am offiziellen Eingang Ticketumfang und geöffnete Seilbahnroute prüfen.",
    "Der aktuellen Betreiberbeschilderung zur Golden Bridge folgen.",
    "Bei Wetter- oder Betriebsänderungen keine bestimmte Gondelroute erzwingen.",
  ], { ticket: "Eintritt und Seilbahnleistung nach dem tatsächlich gekauften offiziellen Produkt.", verify: "Geöffnete Seilbahnstrecken und Reihenfolge können sich ändern; vor Ort der offiziellen Wegführung folgen." }),
  connection("goldenBridge", "bana", "cable", 30, "Innerhalb der Ba-Na-Hills-Anlage der aktuellen Seilbahn- und Fußwegbeschilderung zum French-Village-Bereich folgen.", [
    "Nur geöffnete Wege und die aktuelle Betreiberroute benutzen.",
    "Wetter, Wartezeiten und Rückweg zur Talstation laufend mitplanen.",
  ], { verify: "Keine feste interne Linienfolge für Juli 2027 behaupten; die Betreiberbeschilderung vor Ort ist maßgeblich." }),
  connection("bana", "robinson", "car", 130, "Mit der offiziellen Seilbahn zur vereinbarten Talstation zurück und mit dem wartenden Fahrer zum ROBINSON.", [
    "Genügend Zeit für Seilbahnwarteschlangen und den Weg zum Treffpunkt lassen.",
    "Fahrer über den vereinbarten Kontaktweg informieren.",
    "Vor dem Einsteigen Fahrzeug und Hotelziel abgleichen.",
  ], { verify: driverCheck }),
  connection("robinson", "danang-airport", "car", 90, "Mit dem schriftlich bestätigten Club- oder Privattransfer zum Flughafen Da Nang.", [
    "Abholzeit rückwärts von Check-in-Ende und Verkehrspuffer planen.",
    "Fahrer, Fahrzeug und Terminaltreffpunkt an der Rezeption bestätigen.",
    "Am Flughafen zum Schalter der tatsächlich gebuchten Airline gehen.",
  ], { verify: driverCheck }),
  connection("danang-airport", "saigon-airport", "flight", 120, "Den gebuchten Inlandsflug von Da Nang nach Ho-Chi-Minh-Stadt nehmen.", [
    "Beim Check-in Gepäckziel und beide Bordkarten prüfen.",
    "Nur Flugnummer, Terminal und Zeit aus der bestätigten Buchung verwenden.",
    "In Ho-Chi-Minh-Stadt der für den tatsächlichen Anschluss ausgeschilderten Terminalroute folgen; derzeit nutzen Inlandsflüge Terminal 3 und internationale Flüge Terminal 2.",
    "Für den Wechsel erneut genug Zeit für Weg, Sicherheitskontrolle und Ausreise einplanen.",
  ], { ticket: "Airline-Buchung ist verbindlich; Terminalwechsel und Gepäckdurchleitung schriftlich bestätigen lassen.", verify: "Die Terminalordnung wurde erst 2025 geändert. Konkrete Flugzeiten, Gepäckdurchleitung und den Weg T3 → T2 kurz vor Abflug erneut prüfen." }),
];

const connectionsByKey = new Map(connections.map((item) => [`${item.from}>${item.to}`, item]));

export function travelConnection(date, from, to) {
  return connectionsByKey.get(`${date}:${from}>${to}`) ?? connectionsByKey.get(`${from}>${to}`) ?? null;
}
