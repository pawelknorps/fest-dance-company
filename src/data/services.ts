import concertsImage from '../assets/images/service-concerts.jpeg?format=webp&w=800;1400&as=url'
import concertsSrcSet from '../assets/images/service-concerts.jpeg?format=webp&w=800;1400&as=srcset'
import videosImage from '../assets/images/service-videos.jpeg?format=webp&w=800;1400&as=url'
import videosSrcSet from '../assets/images/service-videos.jpeg?format=webp&w=800;1400&as=srcset'
import eventsImage from '../assets/images/service-events.jpeg?format=webp&w=800;1400&as=url'
import eventsSrcSet from '../assets/images/service-events.jpeg?format=webp&w=800;1400&as=srcset'
import campaignsImage from '../assets/images/reel-bts.jpeg?format=webp&w=800;1400&as=url'
import campaignsSrcSet from '../assets/images/reel-bts.jpeg?format=webp&w=800;1400&as=srcset'
import type { ServiceCard } from '../types'

export const services: ServiceCard[] = [
  {
    id: 'concerts',
    slug: 'koncerty',
    title: 'Koncerty',
    shortCopy: 'Oprawa choreograficzna koncertów i tras z ruchem scenicznym szytym pod artystę.',
    longCopy:
      'W FDC tworzymy kompleksową oprawę choreograficzną koncertów, zawsze dopasowaną do stylu, wizji i energii artysty. Każdy projekt realizujemy indywidualnie — od choreografii i ruchu scenicznego, także pomiędzy utworami, po nieszablonowe działania performatywne. Pracujemy na istniejącej scenografii lub tworzymy ją od podstaw, wzbogacając ją o rekwizyty i elementy wizualne. Całość dopełniamy autorskimi kostiumami, zaprojektowanymi specjalnie pod dany numer lub koncert, aby ruch, obraz i muzyka tworzyły spójną, zapadającą w pamięć całość.',
    coverImage: {
      src: concertsImage,
      srcSet: concertsSrcSet,
      alt: 'Dynamiczny kadr koncertowy z performerami FEST - Choreografia na scenę',
      width: 1536,
      height: 2048,
    },
    tags: ['choreografia', 'ruch sceniczny', 'kostium'],
  },
  {
    id: 'videos',
    slug: 'teledyski',
    title: 'Teledyski',
    shortCopy: 'Ruch dla kamery, który prowadzi emocję utworu i zostaje w pamięci widza.',
    longCopy:
      'Opracowujemy choreografię oraz ruch sceniczny do teledysków — zarówno dla profesjonalnych tancerzy, jak i artystów oraz muzyków. Budujemy język ruchu dopasowany do charakteru utworu, estetyki obrazu i osobowości wykonawcy. Współpracujemy z reżyserem ruchu, który wspiera artystów w odnalezieniu naturalnego sposobu poruszania się przed kamerą. Dbamy o to, aby każdy gest wynikał z emocji, a ruch traktujemy jako element dramaturgii, który prowadzi emocje i podkreśla strukturę muzyki.',
    coverImage: {
      src: videosImage,
      srcSet: videosSrcSet,
      alt: 'Zespół tancerek w kadrze stylizowanym do teledysku - Movement Direction FEST',
      width: 1536,
      height: 2048,
    },
    tags: ['movement direction', 'set coaching', 'storytelling'],
  },
  {
    id: 'events',
    slug: 'eventy',
    title: 'Eventy',
    shortCopy: 'Spektakularne openingi, gale i wydarzenia firmowe z konceptem ruchowym od A do Z.',
    longCopy:
      'Tworzymy kompleksową oprawę artystyczną eventów, od koncepcji kreatywnej i scenariusza ruchu, przez choreografię, po pełną koordynację realizacyjną. Projektujemy widowiska otwarcia gal, premiery produktów, jubileusze i pokazy mody. Naszym celem jest tworzenie wydarzeń, które nie są jedynie programem artystycznym, lecz przemyślanym, zapadającym w pamięć spektaklem, gdzie ruch, światło i muzyka budują spójne doświadczenie.',
    coverImage: {
      src: eventsImage,
      srcSet: eventsSrcSet,
      alt: 'Performerska kompozycja eventowa w przestrzeni premium - FEST Dance Company',
      width: 1536,
      height: 2048,
    },
    tags: ['opening act', 'event concept', 'koordynacja'],
  },
  {
    id: 'campaigns',
    slug: 'kampanie',
    title: 'Kampanie',
    shortCopy: 'Choreografia i performance dla marek, które chcą mówić obrazem, nie tylko copy.',
    longCopy:
      'Projektujemy ruch i obraz dla kampanii reklamowych, nadając markom wyrazisty charakter. Tworzymy choreografię i koncepcje performatywne do produkcji telewizyjnych, digitalowych oraz kampanii wizerunkowych. Dbamy o każdy detal — od castingu performerów, przez opracowanie języka ruchowego, po współpracę z zespołem kreatywnym na planie. Ruch traktujemy jako narzędzie storytellingu, które buduje napięcie i autentyczność przekazu.',
    coverImage: {
      src: campaignsImage,
      srcSet: campaignsSrcSet,
      alt: 'Backstage sesji reklamowej z kamerą i zespołem performerskim - FEST Production',
      width: 2048,
      height: 1536,
    },
    tags: ['brand movement', 'casting', 'performance concept'],
  },
]
